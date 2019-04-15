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
	cvcontainer:{
		width: '100%',
		height: '90%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: "50px",
	},
	canvas:{
		boxShadow: "0 5px 10px rgba(0, 0, 0, 0.35),0 5px 7px rgba(0, 0, 0, 0.24)",
	},
	
});

class HandleButtonClick{constructor(){}}

class MainBoard extends React.Component {

	state = {
		something: null,
	};

	render() {

		const { classes } = this.props;
		// const workspaces = JSON.parse(document.getElementById("datawps").textContent)['workspaces'];
		return (
			<main className={classes.content}>
			{/*<div className={classes.appBarSpacer} />*/}
			<div className={classes.cvcontainer} id="cvcontainer">
				<canvas id="canvas" className={classes.canvas}></canvas>
			</div>
			</main>
			);
	}
}

MainBoard.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MainBoard);