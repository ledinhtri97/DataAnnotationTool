import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SkipNext from '@material-ui/icons/SkipNext';
import Beenhere from '@material-ui/icons/Beenhere';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

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
import Home from '@material-ui/icons/Home';

import generalListItems from './listitem/generalListItems';
import historyListItems from './listitem/historyListItems';
import toolListItems from './listitem/toolListItems';

import {outWorkSpace} from "../modules/dat-utils"

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import TemporaryDrawerInstruction from "./drawerInstruction";
import TemporaryDrawerSettings from "./drawerSettings";

import MainBoard from "./mainboard";

// import ListItemIcon from '@material-ui/core/ListItemIcon';

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
    mainboard:{
    	width: '100%',
    	height: '100%',
    },
    span:{
    	display: 'inline-flex',
    },
    heading: {
    	fontSize: theme.typography.pxToRem(15),
    	flexBasis: '33.33%',
    	flexShrink: 0,
    },
    tabExpandTitle:{
    	paddingRight: '0 !important',
    	paddingLeft: '16px !important',
    },
    tabExpandSumary:{
    	margin: "3px 0 !important",
    },
    tabExpandDetail:{
    	padding: 0,
    },
    listItem: {
    	width: '100%',
    },
    padcontroller:{
    	marginLeft: "50px",
    },
    lightTooltip: {
    	backgroundColor: theme.palette.common.white,
    	color: 'rgba(0, 0, 0, 0.87)',
    	boxShadow: theme.shadows[1],
    	fontSize: 11,
    },
    button: {
    	margin: theme.spacing.unit,
    	width: '150px',
    },
    hidden: {
    	display: 'none',
    },
});

// {/*<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">*/}

class MenuAppBar extends React.Component {
	
	state = {
		anchorEl: null,
		open: true,
		expanded: 'panel1',
	};

	handleExpandInDrawer = panel => (event, expanded) => {
		this.setState({
			expanded: expanded ? panel : false,
		});
	};

	handleDrawerOpen = () => {
		if(document.getElementById("home") == null){
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

	handleWorkspace = () => {
		this.setState({ anchorEl: null });
		var meta_id = document.getElementById("meta_id");
		var url_workspace = document.getElementById("url_workspace").textContent;
		if(meta_id){
			outWorkSpace(meta_id.textContent, url_workspace);
		}
		else{
			window.location.href = url_workspace;
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

	init_value = (value) => {
		return JSON.parse(document.getElementById("settings_data").textContent)['settings'][value];
	};

	render() {
		const { classes } = this.props;
		const { anchorEl, expanded } = this.state;
		const open = Boolean(anchorEl);

		const ON_HOMEPAGE =  document.getElementById("home") != null;
		const ON_WORKSPACE = document.getElementById("project") != null;
		const ON_WORKING = document.getElementById("meta_id") != null;

		return (	
			<div className={classes.root}>
			<CssBaseline />
			<AppBar position={ON_HOMEPAGE ? "static" : "absolute"}
			className={classNames(classes.root_appbar, !ON_HOMEPAGE && classes.appBar, !ON_HOMEPAGE && this.state.open && classes.appBarShift)}>
			<Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
			<IconButton
			color="inherit"
			aria-label="Open drawer"
			onClick={this.handleDrawerOpen}
			className={classNames(classes.menuButton, !ON_HOMEPAGE && this.state.open && classes.menuButtonHidden,)}>
			{!ON_HOMEPAGE && (<MenuIcon />)}
			</IconButton>
			<IconButton aria-haspopup="true" color="inherit" onClick={this.handleWorkspace}>
			<Home />
			</IconButton>
			<Typography variant="h6" color="inherit" className={classes.grow}>Data Annotation Tool - GVLab</Typography>
			<div>
			{
				ON_WORKING && (
					<React.Fragment>
					<Button id="label" variant="contained" color="primary" className={classes.button}>NO LABEL</Button>
					<Tooltip 
					title="Skip and next" 
					TransitionComponent={Zoom} 
					placement="bottom" 
					classes={{tooltip: classes.lightTooltip}}>
					<IconButton id="skip_next" aria-haspopup="true" color="inherit">
					<SkipNext />
					</IconButton>
					</Tooltip>
					<Tooltip 
					title="Save and continue" 
					TransitionComponent={Zoom} 
					placement="bottom" 
					classes={{tooltip: classes.lightTooltip}}>
					<IconButton id="save_next" aria-haspopup="true" color="inherit">
					<Beenhere />
					<KeyboardArrowRight />
					</IconButton>
					</Tooltip>
					</React.Fragment>)
			}
			<Chip label={document.getElementById("username").textContent} className={classNames(classes.chip, ON_WORKING && classes.padcontroller)} />
			{ON_WORKING && <span id="keyboard" className={classes.span} />}
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
		{/*<MenuItem onClick={this.handleClose}>Profile</MenuItem>*/}
		<MenuItem onClick={this.handleWorkspace}>Main Workspace</MenuItem>
		<MenuItem onClick={this.handleLogout}>Log out</MenuItem>
		</Menu>
		</div>
		</Toolbar>
		</AppBar>

		{ON_WORKSPACE && (<Drawer
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
			<List className={classes.listItem}>{React.createElement(generalListItems)}</List>
			<Divider />
			<List className={classes.listItem}>{React.createElement(historyListItems)}</List>
			</Drawer>
			)}

		{ON_WORKING && (<Drawer
			variant="permanent"
			classes={{
				paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
			}}
			open={this.state.open}
			>
			<div className={classes.toolbarIcon}>

			<span id="settings" title="Settings" className={classes.span} />
			<div className={classes.hidden}>
			<span id="show_popup">{this.init_value("show_popup")}</span>
			<span id="auto_hidden">{this.init_value("auto_hidden")}</span>
			<span id="auto_predict">{this.init_value("auto_predict")}</span>
			<span id="ask_dialog">{this.init_value("ask_dialog")}</span>
			<span id="color_background">{this.init_value("color_background")}</span>
			<span id="size_icon">{this.init_value("size_icon")}</span>
			<span id="width_stroke">{this.init_value("width_stroke")}</span>
			</div>

			<IconButton onClick={this.handleDrawerClose}>
			<ChevronLeftIcon />
			</IconButton>
			</div>


			<ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleExpandInDrawer('panel1')}>
			<ExpansionPanelSummary classes={{content: classes.tabExpandSumary}}>
			<ListItem button className={classes.tabExpandTitle}>
			<ListItemText primary="Tools"/>
			</ListItem>
			</ExpansionPanelSummary>
			<ExpansionPanelDetails className={classes.tabExpandDetail}>
			<Divider />
			<List className={classes.listItem}>{React.createElement(toolListItems)}</List>
			</ExpansionPanelDetails>
			</ExpansionPanel>

			<ExpansionPanel expanded={expanded === 'panel2'} onChange={this.handleExpandInDrawer('panel2')}>
			<ExpansionPanelSummary classes={{content: classes.tabExpandSumary}}>
			<ListItem button className={classes.tabExpandTitle}>
			<ListItemText primary="Labels"/>
			</ListItem>
			</ExpansionPanelSummary>
			<ExpansionPanelDetails className={classes.tabExpandDetail}>
			<Divider />
			<List className={classes.listItem} id="label_list_items">
			</List>
			</ExpansionPanelDetails>
			</ExpansionPanel>


			<ExpansionPanel expanded={expanded === 'panel3'} onChange={this.handleExpandInDrawer('panel3')}>
			<ExpansionPanelSummary classes={{content: classes.tabExpandSumary}}>
			<ListItem button className={classes.tabExpandTitle}>
			<ListItemText primary="General" />
			</ListItem>
			</ExpansionPanelSummary>
			<ExpansionPanelDetails className={classes.tabExpandDetail}>
			<Divider />
			<List className={classes.listItem}>{React.createElement(generalListItems)}</List>
			</ExpansionPanelDetails>
			</ExpansionPanel>


			</Drawer>
			)}


		{ON_WORKING && <div id="mainboard" className={classes.mainboard}></div>}

		</div>	
		);
}
}

MenuAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MenuAppBar);