import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import FilterFrames from '@material-ui/icons/FilterFrames';
import IconButton from '@material-ui/core/IconButton';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import { withStyles } from '@material-ui/core/styles';

import AlertDialogChangeClass from "./dialog-changeclass";

const styles = theme => ({
	lightTooltip: {
		backgroundColor: theme.palette.common.white,
		color: 'rgba(0, 0, 0, 0.87)',
		boxShadow: theme.shadows[1],
		fontSize: 11,
	},
	icon: {
		paddingLeft: "5px",
		paddingRight: "25px",
		margin: 0,
		cursor: "pointer",
	},
	listItem: {
		padding: '5px',
		paddingLeft: '16px',
	},
	textItem: {
		padding: 0,	
	},
	iconControll: {
		padding: '7px',
	},
	iconcc: {
		fontSize: '20px',
	},
	close: {
		padding: theme.spacing(0.5),
	},
	rootFromControlLabel: {
		margin: 0,
	},
	rootCheckbox: {
		padding: 0,
	},
});

class LabelItem extends React.Component {

		queue = [];

		constructor(props){
			super(props);
			this.state = {
				namelabel: props.labelControl.getNameLabel(),
				shortnamelabel: props.labelControl.getShortNamelabel(),
			}
		};

		callSetName = (name) => {
			this.setState({ namelabel: name, shortnamelabel: name.length < 5 ? name : name.substring(0, 4)+'...'});
		};

		render() {

			const selfitem = this;
			const { classes, labelControl } = this.props;
			const { namelabel, shortnamelabel } = this.state;

			return(
				<div 
				onMouseEnter={function(){labelControl.__overITEM__()}}
				onMouseLeave={function(){labelControl.__outITEM__()}}>
						<ListItem className={classes.listItem}>
						<Tooltip title={namelabel} TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
						<ListItemIcon className={classes.icon}>
						<IconButton className={classes.iconControll} aria-haspopup="true" color="secondary"
						id={labelControl.getId()+"_changelabel"} onClick={function(e){

								let dialog = document.getElementById("dialog");
								if(dialog){
									ReactDOM.unmountComponentAtNode(dialog);
									ReactDOM.render(<AlertDialogChangeClass
										callSetName={selfitem.callSetName}
										labelControl={labelControl}
										/>, dialog);
								}
				}}>
				<FilterFrames />
				</IconButton>
				</ListItemIcon>
				</Tooltip>
				<ListItemText className={classes.textItem} primary={shortnamelabel} />
				<IconButton id={labelControl.getId()+"_edit"}
					onClick={function(e){labelControl.__editITEM__()}}
					className={classes.iconControll} aria-haspopup="true" color="primary">
				<Edit className={classes.iconcc}/>
				</IconButton>
				<FormControlLabel
					control={
						<Checkbox
							id={labelControl.getId()+"_hidden"}
							icon={
								<IconButton className={classes.iconControll} aria-haspopup="true" color="primary">
								<Visibility className={classes.iconcc}/>
								</IconButton>
							} 
							checkedIcon={
								<IconButton className={classes.iconControll} aria-haspopup="true" color="inherit">
								<VisibilityOff className={classes.iconcc}/>
								</IconButton>
							}
							value="hidden" 
							color="primary"
							classes={{
								root: classes.rootCheckbox,
							}}
							onChange={function(e){labelControl.__hiddenITEM__()}}
						/>
					}
					classes={{
						root: classes.rootFromControlLabel,
					}}
				/>
				<IconButton 
					id={labelControl.getId()+"_delete"}
					onClick={function(e){labelControl.__deleteITEM__()}}
					className={classes.iconControll} aria-haspopup="true" color="primary">
				<Delete className={classes.iconcc}/>
				</IconButton>
				</ListItem>
				</div>
		);
	};
}

LabelItem.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LabelItem);