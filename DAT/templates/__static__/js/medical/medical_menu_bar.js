import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import classNames from 'classnames';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Home from '@material-ui/icons/Home';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import {outWorkSpace} from "../modules/dat-utils"

const drawerWidth = 250;

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
    labeling:{
    	width: '100%',
		height: '100%',
		backgroundColor: 'black', // black background for medical labeling UI
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
	
});

class MedicalMenuBar extends React.Component {
	
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

	back_to_workspace = () => {
		window.location.href = "/gvlab-dat/workspace/";
	};

	render() {
		const { classes } = this.props;
		const { anchorEl, expanded } = this.state;
		const open = Boolean(anchorEl);

		const ON_HOMEPAGE =  document.getElementById("home") != null;
		const ON_WORKING = document.getElementById("meta_id") != null;
		const ON_CONTRIBUTE = document.getElementById("contribute") != null;
		return (	
			<div className={classes.root}>
			<CssBaseline />			   

            {ON_WORKING && (<Drawer
                variant="permanent"
                classes={{
                    paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                }}
                open={this.state.open}
                >
					<div className={classes.toolbarIcon}>
						<span id="workspace" title="Workspace" />
                        <IconButton onClick={this.back_to_workspace}>
                            <Home />
                        </IconButton>
					</div>

                    <div className={classes.toolbarIcon} >
                        <span id="settings" title="Settings" className={classNames(classes.span && !this.state.open && classes.menuButtonHidden,)} />                        
                        <IconButton onClick={this.handleDrawerClose}
                            className={classNames(!this.state.open && classes.menuButtonHidden,)}>
                            <ChevronLeftIcon />
                        </IconButton>
						<IconButton
							color="inherit"
							aria-label="Open drawer"
							onClick={this.handleDrawerOpen}
							className={classNames(this.state.open && classes.menuButtonHidden,)}>
							<ChevronRight />
						</IconButton>
                    </div>

                    <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleExpandInDrawer('panel1')} style={{margin: 0}}>
                        <ExpansionPanelSummary classes={{content: classes.tabExpandSumary}}>
                            <ListItem button className={classes.tabExpandTitle}>
                            <ListItemText primary="Menu"/>
                            </ListItem>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.tabExpandDetail}>
                            <Divider />
                            <List className={classes.listItem} id="labels_list_items"></List>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                </Drawer>
            )}

            {ON_WORKING && <div id="labeling" className={classes.labeling}></div>}
            </div>	
		);
}
}

MedicalMenuBar.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedicalMenuBar);
