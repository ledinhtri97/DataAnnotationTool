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

const styles = theme => ({
    lightTooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
    icon: {
        paddingLeft: "5px",
        paddingRight: "5px",
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
});

class ItemTool extends React.Component {
    render() {
        const { classes, idI, callBackFunc, text, Micon } = this.props;

        return(
            <div id={idI} onClick={callBackFunc}>
            <ListItem button>
            <Tooltip title={text} TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
            <ListItemIcon className={classes.icon}>
            <Micon />
            </ListItemIcon>
            </Tooltip>
            <ListItemText primary={text}/>
            </ListItem>
            </div>
        );
    }
};

class ToolListItems extends React.Component {

    queue = [];

    state = {
        open: false,
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

    handleDisplayTool = (onTool=-1) => {
        let listTool = ["stop_draw", "edit_tool", "hidden_tool", "delete_tool", "change_tool"];
        let i = 0;
        for (i; i < 5; i++){
            if (i === onTool) {
                document.getElementById(listTool[i]).style['backgroundColor'] = "#B6F3F2";
            }
            else{
                document.getElementById(listTool[i]).style['backgroundColor'] = "#FFFFFF";
            }
        }
    };

    handleStopDrawing = () => {
        const {drawTool, drawStatus, quickSettings} = this.props;
        
        this.handleDisplayTool(0);

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
            stop_draw.style['backgroundColor'] = "#FFFFFF";
        }
        else{
            drawTool.quickDraw();
        }
        drawStatus.setModeTool();
    };

    handleSaveNext = () => {
        this.props.controllerRequest('rqsavenext');
    };

    handleSkipNext = () => {
        this.props.controllerRequest('rqnext');
    };

    handleSave = () => {
        this.props.controllerRequest('rqsave');
    };

    handleExited = () => {
        this.processQueue();
    };

    handleEdit = () => {
        let {drawTool, drawStatus} = this.props;
        
        drawTool.endDraw();

        if(drawStatus.getModeTool(0) === 1){
            this.handleDisplayTool();
            drawStatus.setModeTool(); //edit
        }
        else{
            this.handleDisplayTool(1);
            drawStatus.setModeTool(0); //edit
        }  
    };

    handleHidden = () => {
        let {drawTool, drawStatus} = this.props;

        drawTool.endDraw();

        if(drawStatus.getModeTool(1) === 1){
            this.handleDisplayTool();
            drawStatus.setModeTool();
        }
        else{
            this.handleDisplayTool(2);
            drawStatus.setModeTool(1); //hidden
        }
    };
    
    handleDelete = () => {
        let {drawTool, drawStatus} = this.props;
        
        drawTool.endDraw();
        if(drawStatus.getModeTool(2) === 1){
            this.handleDisplayTool();
            drawStatus.setModeTool();
        }
        else{
            this.handleDisplayTool(3);
            drawStatus.setModeTool(2); //delete
        }
    };

    handleChange = () => {
         let {drawTool, drawStatus} = this.props;
        
        drawTool.endDraw();
        if(drawStatus.getModeTool(3) === 1){
            this.handleDisplayTool();
            drawStatus.setModeTool();
        }
        else{
            this.handleDisplayTool(4);
            drawStatus.setModeTool(3); //delete
        }
    };

    render() {
        const { classes, label_select, drawTool, drawStatus, quickSettings } = this.props;
        const { messageInfo } = this.state;
        const tool = this;

        const on_edit = document.getElementById('on_edit') != null;

        return(
            <div>

            <div><ListItem button className={classes.splitTool}></ListItem></div>

             <ItemTool 
                classes={classes} idI="renew_label" callBackFunc={tool.handleRenewLabel} 
                Micon={Autorenew} text="(R) = Renew Label"/>

            <ItemTool 
                classes={classes} idI="stop_draw" callBackFunc={tool.handleStopDrawing} 
                Micon={Brush} text="(Q) = Labeling"/>

            <ItemTool 
                classes={classes} idI="edit_tool" callBackFunc={tool.handleEdit} 
                Micon={ExtensionOutlined} text="(E) = Edit"/>

            <ItemTool 
                classes={classes} idI="hidden_tool" callBackFunc={tool.handleHidden} 
                Micon={ControlCameraOutlined} text="(H) = Hidden"/>

            <ItemTool 
                classes={classes} idI="delete_tool" callBackFunc={tool.handleDelete} 
                Micon={CancelPresentationOutlined} text="(D) = Delete"/>

            <ItemTool 
                classes={classes} idI="change_tool" callBackFunc={tool.handleChange} 
                Micon={PartyModeOutlined} text="(C) = Change Class"/>

            <div><ListItem button className={classes.splitTool}></ListItem></div>

            {
                on_edit ? (<ItemTool 
                classes={classes} idI="only_save" callBackFunc={tool.handleSave} 
                Micon={BeenhereOutlined} text="(S) = Save"/>
                ) : (<React.Fragment>
                
                <ItemTool 
                classes={classes} idI="save_next" callBackFunc={tool.handleSaveNext} 
                Micon={BeenhereOutlined} text="(S) = Save & Next"/>
                <ItemTool 
                    classes={classes} idI="skip_next" callBackFunc={tool.handleSkipNext} 
                    Micon={SkipNext} text="(A) = Skip & Next"/>
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