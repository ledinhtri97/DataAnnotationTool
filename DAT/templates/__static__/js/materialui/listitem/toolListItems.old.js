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
import { SnackbarProvider, withSnackbar } from 'notistack';
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
    }
});

const toolListItems = (props) => {

    var handleClick = (e) => {
        var message = e.currentTarget.textContent;
        props.enqueueSnackbar(message);
    };

    const { classes } = props;

    var labelselect = Array.from(document.getElementById("label_select").children);

    return(
        <div>
        <div id="predict_api">
        <ListItem button className={classes.listItem}>
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
                var spl = lb.textContent.split('-');
                var labelname = spl[0].charAt(0).toUpperCase() + spl[0].slice(1);
                var labeltype = spl[1].charAt(0).toUpperCase() + spl[1].slice(1);
                var message = "Select label " + labelname + " with type " + spl[1];
                return (
                    <div id={lb.textContent} key={key} onClick={handleClick}>
                    <ListItem button>
                    <Tooltip title={labelname + " | " + labeltype} TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
                    <ListItemIcon className={classes.icon}>
                    {MAP_ICON_LABEL[key]}
                    </ListItemIcon>
                    </Tooltip>
                    <ListItemText primary={labelname + " | " + labeltype} />
                    </ListItem>
                    </div>
                    );}
                )
        }

        <div id="stop_draw" onClick={handleClick}>
        <ListItem button className={classes.listItem}>
        <Tooltip title="Stop Drawing" TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
        <ListItemIcon className={classes.icon}>
        <Cancel />
        </ListItemIcon>
        </Tooltip>
        <ListItemText primary="Stop Drawing"/>
        </ListItem>
        </div>

        </div>
        )
};

toolListItems.propTypes = {
  enqueueSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

var apptoolListItems = withSnackbar(withStyles(styles)(toolListItems));

function toolListItemsNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
    {React.createElement(apptoolListItems)}
    </SnackbarProvider>
    );
};

export default toolListItemsNotistack;

// export default withStyles(styles)(toolListItems);
