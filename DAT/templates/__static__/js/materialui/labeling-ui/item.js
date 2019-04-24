import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import FilterFrames from '@material-ui/icons/FilterFrames';
import IconButton from '@material-ui/core/IconButton';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Delete from '@material-ui/icons/Delete';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
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
    paddingRight: "25px",
    margin: 0,
    cursor: "pointer",
  },
  listItem: {
    padding: '5px',
    paddingLeft: '16px',
  },
  textItem: {
    padding: 0,
  },
  iconControll: {
    padding: '7px',
  },
  iconcc: {
    fontSize: '20px',
  },
  close: {
    padding: theme.spacing.unit / 2,
  },
  rootFromControlLabel: {
    margin: 0,
  },
  rootCheckbox: {
    padding: 0,
  },
});

class LabelItem extends React.Component {

  queue = [];

  state = {
    open: false,
    messageInfo: {},
    hidden: false,
  };

  render() {

    const { classes } = this.props;
    const { messageInfo } = this.state;
    const tool = this;
    const labelControl = this.props.labelControl;

    return(
      <div 
        onMouseEnter={function(){labelControl.__overITEM__()}}
        onMouseLeave={function(){labelControl.__outITEM__()}}
        >
      <ListItem className={classes.listItem}>
      <Tooltip title={labelControl.getNamelabel()} TransitionComponent={Zoom} placement="right" classes={{tooltip: classes.lightTooltip}}>
      <ListItemIcon className={classes.icon}>
      <FilterFrames />
      </ListItemIcon>
      </Tooltip>
      <ListItemText className={classes.textItem} primary={labelControl.getNamelabel()} />
      <FormControlLabel
        control={
          <Checkbox
            id={labelControl.getId()+"_hidden"}
            icon={
              <IconButton className={classes.iconControll} aria-haspopup="true" color="primary">
              <Visibility className={classes.iconcc}/>
              </IconButton>
            } 
            checkedIcon={
              <IconButton className={classes.iconControll} aria-haspopup="true" color="inherit">
              <VisibilityOff className={classes.iconcc}/>
              </IconButton>
            }
            value="hidden" 
            color="primary"
            classes={{
              root: classes.rootCheckbox,
            }}
            onChange={function(e){labelControl.__hiddenITEM__()}}
          />
        }
        classes={{
          root: classes.rootFromControlLabel,
        }}
      />
      <IconButton 
        id={labelControl.getId()+"_delete"}
        onClick={function(e){labelControl.__deleteITEM__()}}
        className={classes.iconControll} aria-haspopup="true" color="primary">
      <Delete className={classes.iconcc}/>
      </IconButton>
      </ListItem>
      </div>
      );
  };
}

LabelItem.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LabelItem);