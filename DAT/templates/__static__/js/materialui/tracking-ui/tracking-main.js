import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SvgIcon from '@material-ui/core/SvgIcon';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
	appBarSpacer: theme.mixins.toolbar,
	content: {
		flexGrow: 1,
		width: '100%',
		height: '100%',
		overflow: 'auto',
	},
	firstcontainer: {
		width: '99%',
		height: '99%',
	},
	secondcontainer:{
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	canvas:{
		boxShadow: "0 5px 10px rgba(0, 0, 0, 0.35),0 5px 7px rgba(0, 0, 0, 0.24)",
    	
	},
	label:{
		backgroundColor: "#FFFFFF",
		color: "#0844a7",
		paddingLeft: "3px",
		fontSize: '1rem',
	},
    hidden: {
    	display: 'none',
    },
    horizontal:{
    	width: '100%',
    	height: '50%',
    	display: 'flex',
    },
	vertical:{
		width: '50%',
    	height: '100%',
    	display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

class Subframe extends React.Component{
	state = {

	};

	render(){

		const {classes, idframe} = this.props;

		return (
			<div className={classes.firstcontainer}>
			<div className={classes.secondcontainer} id="cvcontainer" onContextMenu={this.contextMenu}>
				<canvas id={"canvas"+idframe} className={classes.canvas}></canvas>
				<div id={"group_control"+idframe} style={{display: 'none', position: 'absolute',}}>
						{<label id={"label_popup"+idframe} className={classes.label}></label>}
						{<label id={"accuracy_popup"+idframe} className={classes.label}></label>}
				</div>
			</div>
			</div>
		)
	}
}

class Tracking extends React.Component {

	state = {
		something: null,
	};

	render() {

		const { classes } = this.props;
		
		return (
			<main className={classes.content}>
			<div className={classes.horizontal}>
				<div className={classes.vertical}><Subframe classes={classes} idframe={"_1"}/></div>
				<div className={classes.vertical}><Subframe classes={classes} idframe={"_2"}/></div>
			</div>
			<div className={classes.horizontal}>
				<div className={classes.vertical}><Subframe classes={classes} idframe={"_3"}/></div>
				<div className={classes.vertical}><Subframe classes={classes} idframe={"_4"}/></div>
			</div>
			<div className={classes.hidden}>
				<span id="show_popup"></span>
				<span id="show_label"></span>
				<span id="auto_hidden"></span>
				<span id="ask_dialog"></span>
				<span id="color_background"></span>
				<span id="size_icon"></span>
				<span id="width_stroke"></span>
			</div>
			<div className={classes.hidden}>
				<span id="label_select"></span>
			</div>
			</main>
			);
	}
}

Tracking.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Tracking);