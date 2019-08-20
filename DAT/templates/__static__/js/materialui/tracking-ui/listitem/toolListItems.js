import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import OfflineBolt from '@material-ui/icons/OfflineBolt';
import ThumbDownAlt from '@material-ui/icons/ThumbDownAlt';
import Brush from '@material-ui/icons/Brush';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import SkipNext from '@material-ui/icons/SkipNext';
import BeenhereOutlined from '@material-ui/icons/BeenhereOutlined';
import Autorenew from '@material-ui/icons/Autorenew';
import ExtensionOutlined from '@material-ui/icons/ExtensionOutlined';
import ControlCameraOutlined from '@material-ui/icons/ControlCameraOutlined';
import CancelPresentationOutlined from '@material-ui/icons/CancelPresentationOutlined';
import PartyModeOutlined from '@material-ui/icons/PartyModeOutlined';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import {fabric} from 'fabric';
import Slider from '@material-ui/core/Slider';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import LooksOneOutlined from '@material-ui/icons/LooksOneOutlined';
import LooksTwoOutlined from '@material-ui/icons/LooksTwoOutlined';
import Looks3Outlined from '@material-ui/icons/Looks3Outlined';
import Looks4Outlined from '@material-ui/icons/Looks4Outlined';
import SwitchCameraOutlined from '@material-ui/icons/SwitchCameraOutlined';

const styles = theme => ({
    lightTooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
    icon: {
        // paddingLeft: "5px",
        // paddingRight: "5px",
        padding: "5px",
    },
    close: {
        padding: theme.spacing(0.5),
    },
    hidden: {
        display: 'none',
    },
    splitTool:{
        width: '100%',
        height: 3,
        background: '#4285F4',
        padding: 0,
    },
    scaleCanvas: {
        paddingTop: '5px',
        paddingBottom: '5px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
    },
    sliderS: {
        width: '70%',
    },
    listItemRoot: {
        paddingTop: '2px',
        paddingBottom: '2px',
    },
});

class ItemTool extends React.Component {
    render() {
        const { classes, idI, callBackFunc, text, Micon } = this.props;

        return(
            <div id={idI} onClick={callBackFunc}>
            <ListItem button classes={{root: classes.listItemRoot}}>
            <Tooltip title={text} TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
            <ListItemIcon className={classes.icon}>
            <Micon />
            </ListItemIcon>
            </Tooltip>
            </ListItem>
            </div>
        );
    }
};

const PrettoSlider = withStyles({
  root: {
    color: '#52af77',
    height: 6,
  },
  thumb: {
    height: 18,
    width: 18,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -6,
    marginLeft: -10,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-85% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

class ToolListItems extends React.Component {

    queue = [];

    current_tool = "";

    state = {
        open: false,
        changeReLabel: true,
        messageInfo: {},
    };

    contextMenu = function(e) {
        e.preventDefault();
        return false;
    };

    handleClick = (message) => {

        this.queue.push({message, key: new Date().getTime(),});

        if (this.state.open) {
            this.setState({ open: false });
        } else {
            this.processQueue();
        }
    };

    processQueue = () => {
        if (this.queue.length > 0) {
            this.setState({messageInfo: this.queue.shift(), open: true,});
        }
    };

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ open: false });
    };

    handleRenewLabel = () => {
        this.props.drawStatus.setRenewLabel(true);
    };

    handleDisplayTool = (onTool) => {
        const {drawStatus, drawTool} = this.props;
        if (this.current_tool == onTool) {
            drawStatus.setModeTool("");
            document.getElementById(this.current_tool).style['backgroundColor'] = "#FFFFFF";
            if (this.current_tool === "edit_tool") {
                drawTool.stopEditObjects();
            }
            else if (this.current_tool === "linkLabel_tool") {
                drawStatus.resetLinkLabels(true);
            }
            this.current_tool = "";
        }
        else {
            if (this.current_tool) {
                document.getElementById(this.current_tool).style['backgroundColor'] = "#FFFFFF";
                if (this.current_tool === "edit_tool") {
                    drawTool.stopEditObjects();
                }
                else if(this.current_tool === "stop_draw") {
                    drawTool.endDraw();
                }
                else if (this.current_tool === "linkLabel_tool") {
                    drawStatus.resetLinkLabels();
                }
            }
            drawStatus.setModeTool(onTool);
            this.current_tool = onTool;
            document.getElementById(this.current_tool).style['backgroundColor'] = "#B6F3F2";
        }
    };

    handleStopDrawing = () => {
        const {drawTool, drawStatus, quickSettings} = this.props;
        
        this.handleDisplayTool("stop_draw");

        let isDrawing = drawStatus.getIsDrawing();
        let isWaiting = drawStatus.getIsWaiting();
        
        if(quickSettings.getAtt('show_popup')){
            if(isDrawing){
                this.handleClick("Stop labeling mode");
            }
            else{
                this.handleClick("You are not in labeling mode");
            } 
        }

        if(isDrawing && isWaiting){
            drawTool.endDraw();
            document.getElementById('stop_draw').style['backgroundColor'] = "#FFFFFF";
        }
        else{
            drawTool.quickDraw();
            document.getElementById('stop_draw').style['backgroundColor'] = "#B6F3F2";
        }
        drawStatus.setModeTool();
    };

    handleSaveNext = () => {
        this.props.controllerRequest('rqsavenext');
    };

    handleSave = () => {
        this.props.controllerRequest('rqsave');
    };

    handleExited = () => {
        this.processQueue();
    };

    handleEdit = () => {
        this.handleDisplayTool("edit_tool");
    };

    handleHidden = () => {
        this.handleDisplayTool("hidden_tool");
    };
    
    handleDelete = () => {
        this.handleDisplayTool("delete_tool");
    };

    handleChange = () => {
        this.handleDisplayTool("change_tool");
    };

    handleChangeReLabel = name => event => {
        this.props.drawStatus.setTurnRenewLabel(event.target.checked);
        this.setState({ ...this.state, [name]: event.target.checked });
    };

    handleCopyL1 = () => {
        this.handleDisplayTool("copy_1");
    };

    handleCopyL2 = () => {
        this.handleDisplayTool("copy_2");        
    };

    handleCopyL3 = () => {
        this.handleDisplayTool("copy_3");
    };

    handleCopyL4 = () => {
        this.handleDisplayTool("copy_4");
    };

    handleLinkLabel = () => {
        this.handleDisplayTool("linkLabel_tool");
    };

    render() {
        const { classes } = this.props;
        const { messageInfo, changeReLabel } = this.state;
        const tool = this;

        const on_edit = document.getElementById('on_edit') != null;

        return(
            <div>

            <ItemTool 
                classes={classes} idI="copy_1" callBackFunc={tool.handleCopyL1} 
                Micon={LooksOneOutlined} text="Copy label to layer 1 (1)"/>
            
            <ItemTool 
                classes={classes} idI="copy_2" callBackFunc={tool.handleCopyL2} 
                Micon={LooksTwoOutlined} text="Copy label to layer 2 (2)"/>

            <ItemTool 
                classes={classes} idI="copy_3" callBackFunc={tool.handleCopyL3} 
                Micon={Looks3Outlined} text="Copy label to layer 3 (3)"/>
            
            <ItemTool 
                classes={classes} idI="copy_4" callBackFunc={tool.handleCopyL4} 
                Micon={Looks4Outlined} text="Copy label to layer 4 (4)"/>

            <ItemTool 
                classes={classes} idI="linkLabel_tool" callBackFunc={tool.handleLinkLabel} 
                Micon={SwitchCameraOutlined} text="Link labels (T)"/>

            <div>
            <ListItem button classes={{root: classes.listItemRoot}}>
                <FormControlLabel
                control={
                  <Switch
                    checked={changeReLabel}
                    onChange={tool.handleChangeReLabel('changeReLabel')}
                    value="changeReLabel"
                    color="primary"
                  />
                }
            />
            </ListItem>
            </div>

            <ItemTool 
                classes={classes} idI="renew_label" callBackFunc={tool.handleRenewLabel} 
                Micon={Autorenew} text="Renew Label (R)"/>

            <ItemTool 
                classes={classes} idI="stop_draw" callBackFunc={tool.handleStopDrawing} 
                Micon={Brush} text="Labeling (Q)"/>

            <ItemTool 
                classes={classes} idI="edit_tool" callBackFunc={tool.handleEdit} 
                Micon={ExtensionOutlined} text="Edit (E)"/>

            <ItemTool 
                classes={classes} idI="hidden_tool" callBackFunc={tool.handleHidden} 
                Micon={ControlCameraOutlined} text="Hidden (H)"/>

            <ItemTool 
                classes={classes} idI="delete_tool" callBackFunc={tool.handleDelete} 
                Micon={CancelPresentationOutlined} text="Delete (D)"/>

            <ItemTool 
                classes={classes} idI="change_tool" callBackFunc={tool.handleChange} 
                Micon={PartyModeOutlined} text="Change Class (C)"/>

            <div><ListItem button className={classes.splitTool}></ListItem></div>

            {
                on_edit ? (<ItemTool 
                classes={classes} idI="only_save" callBackFunc={tool.handleSave} 
                Micon={BeenhereOutlined} text="Save (S)"/>
                ) : (<React.Fragment>
                
                <ItemTool 
                classes={classes} idI="save_next" callBackFunc={tool.handleSaveNext} 
                Micon={BeenhereOutlined} text="Save & Next (S)"/>
                </React.Fragment>)
            }

            <Snackbar
            key={messageInfo.key} anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
            open={this.state.open} autoHideDuration={6000}
            onClose={this.handleClose} onExited={this.handleExited}
            ContentProps={{'aria-describedby': 'message-id',}}
            message={<span id="message-id">{messageInfo.message}</span>}
            action={[
                <IconButton key="close" aria-label="Close" color="inherit"
                className={classes.close} onClick={this.handleClose} >
                    <CloseIcon />
                </IconButton>,
                ]}
                />
            </div>
        )
    };
}

ToolListItems.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ToolListItems);