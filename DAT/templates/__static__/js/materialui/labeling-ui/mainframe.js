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
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Home from '@material-ui/icons/Home';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import Labeling from './labeling-main'
import generalListItems from './listitem/generalListItems';
import toolListItems from './listitem/toolListItems';

import {outWorkSpace} from "../../modules/dat-utils"

const drawerWidth = 240;

const styles = theme =>({
	root: {
		display: 'flex',
		width: '100%',
		height: '100%',
	},
	grow: {
		flexGrow: 1,
	},
	chip: {
		margin: theme.spacing.unit,
		backgroundColor: "#FFFFFF",
		color: "#0844a7",
		fontSize: '1rem',
	},
	homeIcon: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: '0 12px',
		minHeight: '42px !important',
	},
	toolbarIcon: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: '0 12px',
		minHeight: '42px !important',
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
    labeling:{
    	width: '100%',
    	height: '100%',
    },
    span:{
    	display: 'inline-flex',
    	paddingRight: 20,
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
	
});


class MainFrameLabeling extends React.Component {
	
	state = {
		anchorEl: null,
		open: false,
		expanded: 'panel1',
	};

	handleExpandInDrawer = panel => (event, expanded) => {
		this.setState({
			expanded: expanded ? panel : false,
		});
	};

	handleDrawerChange = () => {
		this.setState({ open: !this.state.open });
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

		return (	
			<div className={classes.root}>
				<Drawer
				variant="permanent"
				classes={{
					paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
				}}
				open={this.state.open}
				>
				<div className={classes.homeIcon}>
				<p style={{paddingRight: 20}}>DAT - GVLab</p>
				<IconButton onClick={this.handleWorkspace}>
				<Home />
				</IconButton>
				</div>

				<div className={classes.toolbarIcon}>
				<span id="settings" title="Settings" className={classes.span} />
				<IconButton onClick={this.handleDrawerChange}>
					{this.state.open ? <ChevronLeftIcon /> : <MenuIcon /> }
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
				<List className={classes.listItem} id="tools_list_items"></List>
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
				<List className={classes.listItem} id="label_list_items"></List>
				</ExpansionPanelDetails>
				</ExpansionPanel>

				</Drawer>

				<div className={classes.labeling}>
					<Labeling />
				</div>
			</div>
		);
	}
}

MainFrameLabeling.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MainFrameLabeling);