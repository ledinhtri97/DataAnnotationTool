import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import OfflineBolt from '@material-ui/icons/OfflineBolt';
import ThumbDownAlt from '@material-ui/icons/ThumbDownAlt';
import Cancel from '@material-ui/icons/Cancel';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import Filter1 from '@material-ui/icons/Filter1';
import Filter2 from '@material-ui/icons/Filter2';
import Filter3 from '@material-ui/icons/Filter3';
import Filter4 from '@material-ui/icons/Filter4';
import Filter5 from '@material-ui/icons/Filter5';
import Filter6 from '@material-ui/icons/Filter6';
import Filter7 from '@material-ui/icons/Filter7';
import Filter8 from '@material-ui/icons/Filter8';
import Filter9 from '@material-ui/icons/Filter9';
import Filter from '@material-ui/icons/Filter';

const MAP_ICON_LABEL = [
<Filter1/>,
<Filter2/>,
<Filter3/>,
<Filter4/>,
<Filter5/>,
<Filter6/>,
<Filter7/>,
<Filter8/>,
<Filter9/>,
<Filter/>,
];

const styles = theme => ({
    lightTooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
    icon: {
        paddingLeft: "5px",
        paddingRight: "25px",
    },
    close: {
        padding: theme.spacing.unit / 2,
    },
    hidden: {
        display: 'none',
    }
});

class ToolListItems extends React.Component {

    queue = [];

    state = {
        open: false,
        messageInfo: {},
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

    handleExited = () => {
        this.processQueue();
    };

    render() {
        const { classes, label_select, drawPoly, drawStatus, quickSettings } = this.props;
        const { messageInfo } = this.state;
        const tool = this;

        return(
            <div>

            <div id="stop_draw" onClick={function(e){

                var isDrawing = drawStatus.getIsDrawing();
                var isWaiting = drawStatus.getIsWaiting();
                
                if(quickSettings.getAtt('show_popup')){
                    if(isDrawing){
                        tool.handleClick("Stop labeling mode");
                    }
                    else{
                        tool.handleClick("You are not in labeling mode");
                    } 
                }

                if(isDrawing && isWaiting){
                    drawPoly.endDraw();
                }
                else{
                    drawPoly.quickDraw();
                }
                
            }}>
            <ListItem button>
            <Tooltip title="Stop Drawing" TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
            <ListItemIcon className={classes.icon}>
            <Cancel />
            </ListItemIcon>
            </Tooltip>
            <ListItemText primary="Stop Drawing"/>
            </ListItem>
            </div>
            
            {
                label_select.map(function(lb, key) {
                    var labelname = lb.tag_label.charAt(0).toUpperCase() + lb.tag_label.slice(1);
                    var labeltype = lb.type_label.charAt(0).toUpperCase() + lb.type_label.slice(1);
                    var _key_ = Math.min(key, 9);
                    return (
                        <div id={lb.id+'_label'} key={key} onClick={function(e){
                                drawPoly.startDraw(lb.id, lb.tag_label, lb.type_label);
                                
                                if(quickSettings.getAtt('show_popup')){
                                    tool.handleClick("Drawing " + labelname + " by " + (lb.type_label =='rect' ? "rectangle" : "polygon") + " shape");
                                }
                                
                            }}>
                        <ListItem button>
                        <Tooltip title={labelname + " | " + labeltype} TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
                        <ListItemIcon className={classes.icon}>
                        {MAP_ICON_LABEL[_key_]}
                        </ListItemIcon>
                        </Tooltip>
                        <ListItemText primary={labelname} />
                        </ListItem>
                        <div id={lb.id+'_color'} className={classes.hidden}>{lb.color}</div>
                        </div>
                        );}
                    )
            }

            <Snackbar
            key={messageInfo.key}
            anchorOrigin={{vertical: 'bottom', horizontal: 'left',}}
            open={this.state.open}
            autoHideDuration={6000}
            onClose={this.handleClose}
            onExited={this.handleExited}
            ContentProps={{'aria-describedby': 'message-id',}}
            message={<span id="message-id">{messageInfo.message}</span>}
            action={[
                // <Button key="undo" color="secondary" size="small" onClick={this.handleClose}>
                // UNDO
                // </Button>,
                <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={this.handleClose}
                >
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