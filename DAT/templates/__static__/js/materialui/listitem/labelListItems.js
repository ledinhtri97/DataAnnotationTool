import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AssignmentIcon from '@material-ui/icons/Assignment';
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
});

const labelListItems = (props) => (
  <div>
  <ListItem button>
  <ListItemIcon>
  <AssignmentIcon />
  </ListItemIcon>
  <ListItemText primary="Current month" />
  </ListItem>
  <ListItem button>
  <ListItemIcon>
  <AssignmentIcon />
  </ListItemIcon>
  <ListItemText primary="Last quarter" />
  </ListItem>
  <ListItem button>
  <ListItemIcon>
  <AssignmentIcon />
  </ListItemIcon>
  <ListItemText primary="All Year-end" />
  </ListItem>
  </div>
  );

export default withStyles(styles)(labelListItems);