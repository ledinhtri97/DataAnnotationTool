import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

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
import {quickSettings} from '../main_module';

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
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 100,
	},
	button: {
		margin: theme.spacing.unit,
		width: '50px',
	},
});

const MAP_SWITCH = {
	'show_popup' : 'Show Popup',
	'auto_hidden' : 'Auto Hidden',
	'auto_predict' : 'Auto Predict',
	'ask_dialog': 'Ask Dialog',
	'color_background': 'Light / Dark Background',
}

const str2var = (value) => {
	var res = JSON.parse(document.getElementById("settings_data").textContent)['settings'][value];
	return res == 'false' ? false : res == 'true' ? true : res;
}

class TemporaryDrawerSettings extends React.Component {
	
	state = {
		left: false,
		checked: {
			'show_popup' : str2var('show_popup'),
			'auto_hidden' : str2var('auto_hidden'),
			'auto_predict' : str2var('auto_predict'),
			'ask_dialog': str2var('ask_dialog'),
			'color_background': str2var('color_background'),
		},
		width_stroke:  str2var('width_stroke'),
		size_icon:  str2var('size_icon'),
	};

	toggleDrawer = (side, open) => () => {
		this.setState({
			[side]: open,
		});
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
		if(name == 'auto_predict'){

		}
		if(name == 'ask_dialog'){

		}
		if(name == 'color_background'){
			document.getElementById("mainboard").style['backgroundColor'] = (event.target.checked) ? "#FFFFFF" : "#332F2F";
		}
	};

	handleNumberChange = (id, canvas) => event => {
		var val = event.target.value;

		if(val > 0){
			if(id == 'size_icon'){
				this.setState({size_icon: val});

				canvas.getObjects().forEach(function(obj){
					if(obj.name_id == 'icon'){
						obj.set('radius', parseInt(val));
					}
				});
				canvas.renderAll();
			}
			else{
				this.setState({'width_stroke': val});

				canvas.getObjects().forEach(function(obj){
					if(obj.type == 'rect' || obj.type == 'polygon'){
						obj.set('strokeWidth', parseInt(val));
					}
				});
				canvas.renderAll();
			}
			quickSettings.setAtt(id, val);
		}
		else{
			alert("Size number min is 1 !");
		}
		
	};

	handleSaveAsDefault = () => {

	};

	render() {
		const { classes } = this.props;
		
		const canvas = this.props.canvas;

		const setts = (
			<div className={classes.list}>

			<ListItem button>
			<ListItemText primary="Settings As Default" />
			<Button variant="contained" color="primary" className={classes.button}>SAVE</Button>
			</ListItem>
			
			<Divider />

			{['show_popup', 'auto_hidden', 'auto_predict', 'ask_dialog', 'color_background'].map((id, key) => (
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
			onChange={this.handleNumberChange('size_icon', canvas)}
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
			onChange={this.handleNumberChange('width_stroke', canvas)}
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
			onKeyDown={this.toggleDrawer('left', false)}
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

// const MainDrawerSettings = withStyles(styles)(TemporaryDrawerSettings)
export default withStyles(styles)(TemporaryDrawerSettings);