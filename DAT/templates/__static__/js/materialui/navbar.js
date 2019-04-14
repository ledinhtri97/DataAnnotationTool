import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import Chip from '@material-ui/core/Chip';
import classNames from 'classnames';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import { mainListItems, secondaryListItems } from './listItems';
import {outWorkSpace} from "../modules/dat-utils"

const drawerWidth = 240;

const styles = theme =>({
	root: {
		flexGrow: 1,
	},
	root_appbar:{
		backgroundColor: "#4285F4",
	},
	grow: {
		flexGrow: 1,
	},
	menuButton: {
		marginLeft: 12,
		marginRight: 36,
	},
	chip: {
		margin: theme.spacing.unit,
		backgroundColor: "#FFFFFF",
		color: "#0844a7",
		fontSize: '1rem',
	},

	menuButtonHidden: {
		display: 'none',
	},

	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	toolbarIcon: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: '0 8px',
		...theme.mixins.toolbar,
	},
	toolbar: {
    	paddingRight: 24, // keep right padding when drawer closed
    },
    
    drawerPaper: {
    	position: 'relative',
    	whiteSpace: 'nowrap',
    	width: drawerWidth,
    	transition: theme.transitions.create('width', {
    		easing: theme.transitions.easing.sharp,
    		duration: theme.transitions.duration.enteringScreen,
    	}),
    },
    drawerPaperClose: {
    	overflowX: 'hidden',
    	transition: theme.transitions.create('width', {
    		easing: theme.transitions.easing.sharp,
    		duration: theme.transitions.duration.leavingScreen,
    	}),
    	width: theme.spacing.unit * 7,
    	[theme.breakpoints.up('sm')]: {
    		width: theme.spacing.unit * 9,
    	},
    },


});

// {/*<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">*/}

class MenuAppBar extends React.Component {
	state = {
		anchorEl: null,
		open: true,
	};

	handleDrawerOpen = () => {
		if(document.getElementById("datawps") == null){
			this.setState({ open: true });
		}
	};

	handleDrawerClose = () => {
		this.setState({ open: false });
	}

	handleChange = event => {
		this.setState({ auth: event.target.checked });
	};

	handleMenu = event => {
		this.setState({ anchorEl: event.currentTarget });
	};

	handleClose = () => {
		this.setState({ anchorEl: null });
	};

	handleWorkspace = () =>{
		this.setState({ anchorEl: null });
		var metaid = document.getElementById("metaid");
		if(metaid){
			outWorkSpace(metaid.textContent, "/gvlab-dat/workspace/");
		}
		else{
			window.location.href = "/gvlab-dat/workspace/";
		}
	}
	
	handleLogout = () => {
		this.setState({ anchorEl: null });
		var metaid = document.getElementById("metaid");
		if(metaid){
			outWorkSpace(metaid.textContent, "/gvlab-dat/logout/");
		}
		else{
			window.location.href = "/gvlab-dat/logout/";
		}
	}

	render() {
		const { classes } = this.props;
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);
		const ismainworkspace = !(document.getElementById("datawps") == null);
		return (	
			<div className={classes.root}>
			<CssBaseline />
			<AppBar position={ismainworkspace ? "static" : "absolute"}
			className={classNames(classes.root_appbar, !ismainworkspace && classes.appBar, !ismainworkspace && this.state.open && classes.appBarShift)}>
			<Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
			<IconButton
			color="inherit"
			aria-label="Open drawer"
			onClick={this.handleDrawerOpen}
			className={classNames(classes.menuButton, !ismainworkspace && this.state.open && classes.menuButtonHidden,)}>
			{!ismainworkspace && (<MenuIcon />)}
			</IconButton>
			<Typography variant="h6" color="inherit" className={classes.grow}>
			Data Annotation Tool - GVLab
			</Typography>
			<div>
			<Chip label={document.getElementById("username").textContent} className={classes.chip} />
			<IconButton
			aria-owns={open ? 'menu-appbar' : undefined}
			aria-haspopup="true"
			onClick={this.handleMenu}
			color="inherit"
			>
			<AccountCircle />
			</IconButton>
			<Menu
			id="menu-appbar"
			anchorEl={anchorEl}
			anchorOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			open={open}
			onClose={this.handleClose}
			>
			<MenuItem onClick={this.handleClose}>Profile</MenuItem>
			<MenuItem onClick={this.handleWorkspace}>Main Workspace</MenuItem>
			<MenuItem onClick={this.handleLogout}>Log out</MenuItem>
			</Menu>
			</div>
			</Toolbar>
			</AppBar>

			{!ismainworkspace && (<div><Drawer
				variant="permanent"
				classes={{
					paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
				}}
				open={this.state.open}
				>
				<div className={classes.toolbarIcon}>
				<IconButton onClick={this.handleDrawerClose}>
				<ChevronLeftIcon />
				</IconButton>
				</div>
				<Divider />
				<List>{mainListItems}</List>
				<Divider />
				<List>{secondaryListItems}</List>
				</Drawer>
				</div>
				)}

			</div>
			);
	}
}

MenuAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MenuAppBar);