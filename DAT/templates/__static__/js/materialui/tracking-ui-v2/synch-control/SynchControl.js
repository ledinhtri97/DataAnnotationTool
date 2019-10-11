import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ListItem from '@material-ui/core/ListItem';

import Filter1 from '@material-ui/icons/Filter1';
import Filter2 from '@material-ui/icons/Filter2';
import Filter3 from '@material-ui/icons/Filter3';
import Filter4 from '@material-ui/icons/Filter4';
import DeleteSweepOutlined from '@material-ui/icons/DeleteSweepOutlined';
import Fullscreen from '@material-ui/icons/Fullscreen';
import FullscreenExit from '@material-ui/icons/FullscreenExit';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

const stylesSynch = theme => ({
	exCustom: {
		margin: '0 !important',
		padding: '0 !important',
		minHeight: '0 !important',
		flexGrow: '0 !important',
	},
	exDetail:{
		flexDirection: 'column',
		padding: '2px',
    	justifyContent: 'center',
    	alignItems: 'center',
	},
	rootPanel: {
		backgroundColor: 'rgba(0, 0, 0, 0)',
	},
	listItemRoot: {
        paddingTop: '2px',
        paddingBottom: '2px',
    },
    guttersCustom: {
    	padding: '3px',
    	justifyContent: 'center',
    },
    formControlCustom: {
    	margin: 0,
    },
    checkedBox: {
    	padding: '2px',
    },
    lightTooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
});

class SynchControl extends React.Component {
	state = {
		expanded: false,
		cx: false,
	};

	handleChange = panel => (event, expanded) => {
    	this.setState({
			expanded: expanded ? panel : false,
		});
	};

	handleChangeCheckedBox = name => event => {
    	this.setState({ ...this.state, [name]: event.target.checked });

    	const {idframe, drawStatus} = this.props;

    	drawStatus.setAutoSynch(idframe, event.target.checked);
  	};

  	handleOpenFullScreen = () => {
  		//return;
  		const {idframe, drawTool} = this.props;
  		document.getElementById('in_full_screen').style["display"] = "";
		document.getElementById('out_full_screen').style["display"] = "none";
		let c_full = document.getElementById('change_full_view');
		c_full && c_full.click();
		drawTool.inFullScreen(idframe);
  	};

  	handleExitFullScreen = () => {
  		// return;
  		const {idframe, drawTool} = this.props;
  		document.getElementById('in_full_screen').style["display"] = "none";
		document.getElementById('out_full_screen').style["display"] = "";
		let c_full = document.getElementById('change_full_view');
		c_full && c_full.click();
		drawTool.outFullScreen();
  	};

  	copyAllToLayerT = () => {
  		const {idframe, drawTool} = this.props;
  		drawTool.copyAllObjects(idframe, '_b');
  	};

  	copyAllToLayerB = () => {
  		const {idframe, drawTool} = this.props;
  		drawTool.copyAllObjects(idframe, '_t');
  	};

  	deleteAllObjects = () => {
  		alert("Feature in future!");
  	};

	render(){
		
		const {expanded, cx} = this.state;
		const {classes, idframe} = this.props;
		const synthis = this;
		const fs_text = idframe == '_full' ? "Exit full screen" : "Open full screen";
		return (
			<React.Fragment>
				<ExpansionPanel classes={{root: classes.rootPanel}} expanded={expanded === 'p1'} onChange={this.handleChange('p1')}>
			        <ExpansionPanelSummary
			          expandIcon={<ExpandMoreIcon />}
			          aria-controls={"panel1bh-content"+idframe}
			          id={"panel1bh-header"+idframe}
			          classes={{
				          	root: classes.exCustom,
				          	expanded: classes.exCustom,
				          	content: classes.exCustom, 
				          	expandIcon: classes.exCustom, 
			          	}}
			        >
					</ExpansionPanelSummary>
				    <ExpansionPanelDetails classes={{root: classes.exDetail}}>
				    	<ListItem button classes={{
					        	root: classes.listItemRoot, 
					        	gutters: classes.guttersCustom}}>
					        <Tooltip title={fs_text} TransitionComponent={Zoom}
					        		placement="right" classes={{tooltip: classes.lightTooltip}}>
					        	{idframe == '_full' ? 
					        		<FullscreenExit id='exit_full_screen' onClick={this.handleExitFullScreen}/> : 
					        		<Fullscreen onClick={this.handleOpenFullScreen}/>}
					        </Tooltip>
					    </ListItem>

					    {idframe != '_full' ?
					    	<React.Fragment>
						    {idframe == '_t' ? <ListItem button classes={{
						        	root: classes.listItemRoot, 
						        	gutters: classes.guttersCustom}}>
						        	<Tooltip title="Copy to layer Bottom" TransitionComponent={Zoom}
						        		placement="right" classes={{tooltip: classes.lightTooltip}}>
						        	<Filter2 onClick={synthis.copyAllToLayerT}/>
						        	</Tooltip>
					        	</ListItem> : null
					    	}
					        {idframe == '_b' ? <ListItem button classes={{
						        	root: classes.listItemRoot, 
						        	gutters: classes.guttersCustom}}>
						        	<Tooltip title="Copy to layer Top" TransitionComponent={Zoom}
						        		placement="right" classes={{tooltip: classes.lightTooltip}}>
						        	<Filter1 onClick={synthis.copyAllToLayerB}/>
						        	</Tooltip>
						        </ListItem> : null
					    	}

					    	<ListItem button classes={{
					        	root: classes.listItemRoot, 
					        	gutters: classes.guttersCustom}}>
					        	<Tooltip title="Delete all labels" TransitionComponent={Zoom}
					        		placement="right" classes={{tooltip: classes.lightTooltip}}>
					        	<DeleteSweepOutlined onClick={synthis.deleteAllObjects}/>
					        	</Tooltip>
					        </ListItem>

					    	<ListItem button classes={{
					        	root: classes.listItemRoot, 
					        	gutters: classes.guttersCustom}}>
					        <Tooltip title="Auto synchronized" TransitionComponent={Zoom} 
					        	placement="right" classes={{tooltip: classes.lightTooltip}}>
					        <FormControlLabel
					        	classes={{root: classes.formControlCustom}}
						        control={
						          <Checkbox
						          	classes={{root: classes.checkedBox}}
						            checked={cx}
						            onChange={this.handleChangeCheckedBox('cx')}
						            value="cx"
						            color="primary"
						          />
						        }
						    />
						    </Tooltip>
						    </ListItem>
					    </React.Fragment> : null 
						}
				    </ExpansionPanelDetails>
				</ExpansionPanel>
			</React.Fragment>
		)
	}
}

SynchControl.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(stylesSynch)(SynchControl);