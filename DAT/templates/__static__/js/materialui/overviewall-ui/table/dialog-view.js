import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

const styles = theme => ({
  iframeL: {
    width: '100%',
    height: '100%',
    padding: 0,
    display: "initial",
    position: "relative",
  },
  appBar: {
    position: 'relative',
  },
  toolBar: {
    minHeight: "0 !important",
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


class AlertDialogView extends React.Component {
  state = {
    open: true,
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, name, metaid } = this.props;
    const self_view = this;
    return (
        <Dialog fullScreen open={this.state.open} onClose={this.handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar className={classes.toolBar}>
            <IconButton edge="start" color="inherit" onClick={this.handleClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <iframe src={"/gvlab-dat/workspace/edit_metaid-"+metaid} className={classes.iframeL}></iframe>
      </Dialog>
    );
  }
}

AlertDialogView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AlertDialogView);

