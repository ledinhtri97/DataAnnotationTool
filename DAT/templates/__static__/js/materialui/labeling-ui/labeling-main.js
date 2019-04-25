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
		padding: theme.spacing.unit * 2,
		width: '100%',
		height: '100%',
		overflow: 'auto',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	firstcontainer:{
		width: '100%',
		height: '95%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: "50px",
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
	
});

const MAP_ICON_INS = {
	A: (<IconButton style={{padding:"5px",color: "#000000",}}><SvgIcon><path d="M3,5C3,3.9 3.9,3 5,3H19C20.1,3 21,3.9 21,5V19C21,20.1 20.1,21 19,21H5C3.89,21 3,20.1 3,19V5M11,7C9.9,7 9,7.9 9,9V17H11V13H13V17H15V9C15,7.9 14.1,7 13,7H11M11,9H13V11H11V9Z" /></SvgIcon></IconButton> ),
	S: (<IconButton style={{padding:"5px",color: "#000000",}}><SvgIcon><path d="M11,7A2,2 0 0,0 9,9V11A2,2 0 0,0 11,13H13V15H9V17H13A2,2 0 0,0 15,15V13A2,2 0 0,0 13,11H11V9H15V7H11M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	E: (<IconButton style={{padding:"5px",color: "#000000",}}><SvgIcon><path d="M9,7V17H15V15H11V13H15V11H11V9H15V7H9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	H: (<IconButton style={{padding:"5px",color: "#000000",}}><SvgIcon><path d="M9,7V17H11V13H13V17H15V7H13V11H11V7H9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	D: (<IconButton style={{padding:"5px",color: "#000000",}}><SvgIcon><path d="M9,7V17H13A2,2 0 0,0 15,15V9A2,2 0 0,0 13,7H9M11,9H13V15H11V9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	Q: (<IconButton style={{padding:"5px",color: "#000000",}}><SvgIcon><path d="M11,7A2,2 0 0,0 9,9V15A2,2 0 0,0 11,17V19H13V17A2,2 0 0,0 15,15V9A2,2 0 0,0 13,7H11M11,9H13V15H11V9M5,4H19A2,2 0 0,1 21,6V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V6A2,2 0 0,1 5,4Z" /></SvgIcon></IconButton> ),
};

class HandleButtonClick{constructor(){}}

class Labeling extends React.Component {

	state = {
		something: null,
	};

	render() {

		const { classes } = this.props;
		// const workspaces = JSON.parse(document.getElementById("datawps").textContent)['workspaces'];
		return (
			<main className={classes.content}>
			{/*<div className={classes.appBarSpacer} />*/}
			<div className={classes.firstcontainer}>
				<div className={classes.secondcontainer} id="cvcontainer">
					<canvas id="canvas" className={classes.canvas}></canvas>
					<div id="group_control" style={{display: 'none', position: 'absolute',}}>
						{<label id="label_popup" className={classes.label}></label>}
						{<label id="accuracy_popup" className={classes.label}></label>}
					</div>
				</div>
			</div>
			</main>
			);
	}
}

Labeling.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Labeling);