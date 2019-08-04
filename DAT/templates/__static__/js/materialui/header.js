import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import Chip from '@material-ui/core/Chip';
import CssBaseline from '@material-ui/core/CssBaseline';
import Home from '@material-ui/icons/Home';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import {outWorkSpace} from "../modules/general-mod/request/outWorking";

const drawerWidth = 240;

const styles = theme =>({
	root: {
		display: 'flex',
		width: '100%',
		height: '100%',
	},
	root_appbar:{
		backgroundColor: "#4285F4",
		minHeight: "45px",
	},
	grow: {
		flexGrow: 1,
	},
	chip: {
		margin: theme.spacing(1),
		backgroundColor: "#FFFFFF",
		color: "#0844a7",
		fontSize: '1rem',
	},

	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
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
		padding: "0 24px",
    },
    lightTooltip: {
    	backgroundColor: theme.palette.common.white,
    	color: 'rgba(0, 0, 0, 0.87)',
    	boxShadow: theme.shadows[1],
    	fontSize: 11,
    },
});

class Header extends React.Component {
	
	state = {
		anchorEl: null,
		open: false,
		expanded: 'panel1',
	};

	handleChange = event => {
		this.setState({ auth: event.target.checked });
	};

	handleMenu = event => {
		this.setState({ anchorEl: event.currentTarget });
	};

	handleClose = () => {
		this.setState({ anchorEl: null });
	};

	handleWorkspace = () => {
		this.setState({ anchorEl: null });
		var meta_id = document.getElementById("meta_id");
		var url_home = document.getElementById("url_home").textContent;
		if(meta_id){
			outWorkSpace(meta_id.textContent, url_home);
		}
		else{
			window.location.href = url_home;
		}
	};

	handlePassword = () => {
		this.setState({ anchorEl: null });
		var meta_id = document.getElementById("meta_id");
		var url_changepass = document.getElementById("url_changepass").textContent;
		if(meta_id){
			outWorkSpace(meta_id.textContent, url_changepass);
		}
		else{
			window.location.href = url_changepass;
		}
	};
	
	handleLogout = () => {
		this.setState({ anchorEl: null });
		var meta_id = document.getElementById("meta_id");
		var url_logout = document.getElementById("url_logout").textContent;
		if(meta_id){
			outWorkSpace(meta_id.textContent, url_logout);
		}
		else{
			window.location.href = url_logout;
		}
	};

	render() {
		const { classes } = this.props;
		const { anchorEl, expanded } = this.state;
		const open = Boolean(anchorEl);

		const ON_HOMEPAGE = document.getElementById("workspaces") != null;

		return (	
			<div className={classes.root}>
			<CssBaseline />
			<AppBar position={"static"}
			className={classes.root_appbar}>
			<Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
			
			<IconButton aria-haspopup="true" color="inherit" onClick={this.handleWorkspace}>
			<Home />
			</IconButton>
			<Typography variant="h6" color="inherit" className={classes.grow}>Data Annotation Tool - GVLab</Typography>
			<div>

			<Chip label={document.getElementById("username").textContent} className={classes.chip} />
			
			<Tooltip 
			title="Account" 
			TransitionComponent={Zoom} 
			placement="bottom" 
			classes={{tooltip: classes.lightTooltip}}>
			<IconButton 
			aria-owns={open ? 'menu-appbar' : undefined} 
			aria-haspopup="true" onClick={this.handleMenu} color="inherit">
			<AccountCircle />
			</IconButton>
			</Tooltip>
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
		<MenuItem onClick={this.handleWorkspace}>Main Workspace</MenuItem>
		<MenuItem onClick={this.handlePassword}>Change Password</MenuItem>
		<MenuItem onClick={this.handleLogout}>Log out</MenuItem>
		</Menu>
		</div>
		</Toolbar>
		</AppBar>
		</div>
		);
	}
}

Header.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);