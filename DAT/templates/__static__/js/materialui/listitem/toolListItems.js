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

const MAP_ICON_LABEL = [
<Filter1/>,
<Filter2/>,
<Filter3/>,
<Filter4/>,
<Filter5/>,
<Filter6/>,
<Filter7/>,
<Filter8/>,
<Filter9/>
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

class toolListItems extends React.Component {

    queue = [];

    state = {
        open: false,
        messageInfo: {},
    };

    handleClick = message => () => {
        if(message == 'stop'){
            message = document.getElementById("stop_mode").textContent;
        }
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
        const { classes } = this.props;
        const { messageInfo } = this.state;
        const tool = this;

        // var labelselect = Array.from(document.getElementById("label_select").children);
        var labelselect = JSON.parse(document.getElementById("label_select").textContent)['labels'];
        labelselect.pop();

        return(
            <div>
            <div id="predict_api" onClick={tool.handleClick("Predict API is hidden!!! read more in the instruction")}>
            <ListItem button>
            <Tooltip title="Predict API" TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
            <ListItemIcon className={classes.icon}>
            <OfflineBolt />
            </ListItemIcon>
            </Tooltip>
            <ListItemText primary="Predict API" />
            </ListItem>
            </div>

            <div id="bad_data">
            <ListItem button>
            <Tooltip title="Bad Data" TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
            <ListItemIcon className={classes.icon}>
            <ThumbDownAlt />
            </ListItemIcon>
            </Tooltip>
            <ListItemText primary="Bad Data" />
            </ListItem>
            </div>

            {
                labelselect.map(function(lb, key) {
                    var spl = lb.id.split('-');
                    var labelname = spl[0].charAt(0).toUpperCase() + spl[0].slice(1);
                    var labeltype = spl[1].charAt(0).toUpperCase() + spl[1].slice(1);
                    var message = "Drawing " + labelname + " by " + (spl[1]=='rect'? "rectangle" : "polygon") + " shape";
                    return (
                        <div id={lb.id} key={key} onClick={tool.handleClick(message)}>
                        <ListItem button>
                        <Tooltip title={labelname + " | " + labeltype} TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
                        <ListItemIcon className={classes.icon}>
                        {MAP_ICON_LABEL[key]}
                        </ListItemIcon>
                        </Tooltip>
                        <ListItemText primary={labelname + " | " + labeltype} />
                        </ListItem>
                        <div id={lb.id+'_color'} className={classes.hidden}>{lb.color}</div>
                        </div>
                        );}
                    )
            }

            <div id="stop_draw" onClick={tool.handleClick('stop')}>
            <ListItem button>
            <Tooltip title="Stop Drawing" TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
            <ListItemIcon className={classes.icon}>
            <Cancel />
            </ListItemIcon>
            </Tooltip>
            <ListItemText primary="Stop Drawing"/>
            </ListItem>
            </div>

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

toolListItems.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(toolListItems);
