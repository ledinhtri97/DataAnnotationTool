import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import ReactDOM from "react-dom";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Settings from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';

import Switch from '@material-ui/core/Switch';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import {quickSettings} from '../../tracking';
import AlertDialog from "../dialog";

const styles = theme =>({
	list: {
		width: 300,
	},
	fullList: {
		width: 'auto',
	},
	lightTooltip: {
		backgroundColor: theme.palette.common.white,
		color: 'rgba(0, 0, 0, 0.87)',
		boxShadow: theme.shadows[1],
		fontSize: 11,
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: 100,
	},
	button: {
		margin: theme.spacing(1),
		width: '50px',
	},
});

const MAP_SWITCH = {
	'show_popup' : 'Show Popup',
	'show_label' : 'Show Label',
	'auto_hidden' : 'Auto Hidden',
	'ask_dialog': 'Ask Dialog',
	'color_background': 'Light / Dark Background',
}

const str2var = (value) => {
	return value == 'false' ? false : value == 'true' ? true : value;
}

class TemporaryDrawerSettings extends React.Component {
	
	constructor(props){
		super(props);
		this.state = {
			left: false,
			checked: {
				'show_popup': false,
				'show_label': false,
				'auto_hidden': false,
				'ask_dialog': true,
				'color_background': true,
			},
			width_stroke: 8,
			size_icon: 3,
		}
	};

	getData(){
		fetch('/gvlab-dat/workspace/settings/'+'api-get-data/',{})
		.then(response => {
			if(response.status !== 200){
				return "FAILED";
			}
				return response.json();
			}
		).then(sett => {
			
			this.setState({
				checked: {
					'show_popup': str2var(sett.show_popup),
					'show_label': str2var(sett.show_label),
					'auto_hidden': str2var(sett.auto_hidden),
					'ask_dialog': str2var(sett.ask_dialog),
					'color_background': str2var(sett.color_background),
				},
				width_stroke: str2var(sett.width_stroke),
				size_icon: str2var(sett.size_icon),
			});


			document.getElementById("show_popup").textContent = sett.show_popup;
			document.getElementById("show_label").textContent = sett.show_label;
			document.getElementById("auto_hidden").textContent = sett.auto_hidden;
			document.getElementById("ask_dialog").textContent = sett.ask_dialog;
			document.getElementById("color_background").textContent = sett.color_background;
			document.getElementById("width_stroke").textContent = sett.width_stroke;
			document.getElementById("size_icon").textContent = sett.size_icon;
			
		});
	};

	componentDidMount(){
		this.getData();
	};

	toggleDrawer = (side, open) => () => {
		this.setState({
			[side]: open,
		});
	};

	toggleKeyDown = () => event => {
		var key = event.keyCode ? event.keyCode : event.which;
		if(key == 8 || key == 37 || key == 38 || key == 39 || key == 40){
			return;
		}
		else{
			this.setState({
				['left']: false,
			});
		}

	};


	handleChange = (name) => event => {
		const checked_change = this.state.checked;
		checked_change[name] = event.target.checked;
		this.setState({checked: checked_change});
		quickSettings.setAtt(name, event.target.checked);

		if(name == 'show_popup'){

		}
		if(name == 'auto_hidden'){

		}
		if(name == 'ask_dialog'){

		}
		if(name == 'color_background'){
			document.getElementById("labeling").style['backgroundColor'] = (event.target.checked) ? "#FFFFFF" : "#1B1616";
		}
	};

	handleNumberChange = (id) => event => {
		var val = event.target.value;
		var ls_canvas = this.props.canvas;

		if(val >= 0){
			
			if(val == 0){
				val = 1;
			}

			if(id == 'size_icon'){
				this.setState({size_icon: val});

				for(let pos in ls_canvas){
					ls_canvas[pos].getObjects().forEach(function(obj){
						if(obj.islabel){
							obj.icon.set('radius', parseInt(val));
						}
					});
					ls_canvas[pos].renderAll();
				}
			}
			else{
				this.setState({'width_stroke': val});

				for(let pos in ls_canvas){
					ls_canvas[pos].getObjects().forEach(function(obj){
						if(obj.islabel){
							obj.set('strokeWidth', parseInt(val));
						}
					});
					ls_canvas[pos].renderAll();
				}

			}
			quickSettings.setAtt(id, val);
		}
		else{
			alert("Size number min is 1 !");
		}
		
	};

	handleSaveAsDefault = () => {
		var dialog = document.getElementById("dialog");
    	if(dialog){
	      	ReactDOM.unmountComponentAtNode(dialog);
			var message = "Save settings as default?";
			var request = "rqsavesettings";
			ReactDOM.render(<AlertDialog message={message}  request={request} />, dialog);
    	}
	};

	render() {
		const { classes } = this.props;
		
		

		const setts = (
			<div className={classes.list}>

			<ListItem button>
			<ListItemText primary="Settings As Default" />
			<Button 
				onClick={this.handleSaveAsDefault}
				variant="contained" 
				color="primary" className={classes.button}>SAVE</Button>
			</ListItem>
			
			<Divider />

			{['show_popup', 'show_label', 'auto_hidden', 'ask_dialog', 'color_background'].map((id, key) => (
				<ListItem button key={key}>
				<ListItemText primary={MAP_SWITCH[id]} />
				<Switch
				checked={this.state.checked[id]}
				value={this.state.checked[id]}
				onChange={this.handleChange(id)}
				color="primary"
				/>
				</ListItem>
				))}


			<ListItem button>
			<ListItemText primary="Size Icon" />
			<TextField
			label="Number"
			value={this.state.size_icon}
			onChange={this.handleNumberChange('size_icon')}
			type="number"
			className={classes.textField}
			InputLabelProps={{
				shrink: true,
			}}
			margin="normal"
			/>
			</ListItem>

			<ListItem button>
			<ListItemText primary="Width Stroke" />
			<TextField
			label="Number"
			value={this.state.width_stroke}
			onChange={this.handleNumberChange('width_stroke')}
			type="number"
			className={classes.textField}
			InputLabelProps={{
				shrink: true,
			}}
			margin="normal"
			/>
			</ListItem>
			</div>
			);

		return (
			<div>
			<Tooltip 
			title="Quick Settings" 
			TransitionComponent={Zoom} 
			placement="bottom" 
			classes={{tooltip: classes.lightTooltip}}>
			<IconButton onClick={this.toggleDrawer('left', true)} color='inherit' aria-haspopup="true"><Settings/></IconButton>
			</Tooltip>
			<Drawer open={this.state.left} onClose={this.toggleDrawer('left', false)}>
			<div
			tabIndex={0}
			role="button"
			onKeyDown={this.toggleKeyDown()}
			>
			{setts}
			</div>
			</Drawer>
			</div>
			);
	}
}

TemporaryDrawerSettings.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TemporaryDrawerSettings);