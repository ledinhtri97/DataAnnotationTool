import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Label from '@material-ui/icons/Label';
import Equalizer from '@material-ui/icons/Equalizer';
import Home from '@material-ui/icons/Home';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import Settings from '@material-ui/icons/Settings';
import { withStyles } from '@material-ui/core/styles';
import {outWorkSpace} from "../../modules/dat-utils"

const styles = theme => ({
  lightTooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
});

const handleWorkspace = () => {
  var metaid = document.getElementById("metaid");
  if(metaid){
    outWorkSpace(metaid.textContent, "/gvlab-dat/workspace/");
  }
  else{
    window.location.href = "/gvlab-dat/workspace/";
  }
};

const generalListItems = (props) => (
  <div>
  <ListItem button onClick={handleWorkspace}>
  <ListItemIcon>
  <Home />
  </ListItemIcon>
  <ListItemText primary="Main Workspaces"/>
  </ListItem>
  <ListItem button>
  <ListItemIcon>
  <DashboardIcon />
  </ListItemIcon>
  <ListItemText primary="Overview" />
  </ListItem>
  <ListItem button>
  <ListItemIcon>
  <Label />
  </ListItemIcon>
  <ListItemText primary="Labels" />
  </ListItem>
  <ListItem button>
  <ListItemIcon>
  <Equalizer />
  </ListItemIcon>
  <ListItemText primary="Performance" />
  </ListItem>
  <ListItem button>
  <ListItemIcon>
  <Settings />
  </ListItemIcon>
  <ListItemText primary="Setting" />
  </ListItem>
  </div>
  );

export default withStyles(styles)(generalListItems);