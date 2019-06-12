import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = theme => ({
  paperSP: {
    minHeight: 'calc(100% - 25px)',
  },
  rootTitle: {
    padding: '8px 24px 8px 24px',
  },
  text: {
    fontSize: '0.957rem',
    color: 'rgba(181, 18, 18, 0.87)',
  },
  secondcontainer:{
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  canvas:{
    boxShadow: "0 5px 10px rgba(0, 0, 0, 0.35),0 5px 7px rgba(0, 0, 0, 0.24)",
  },
});

class AlertDialogView extends React.Component {
  state = {
    open: true,
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleEdit = (metaid) => {
    window.open(
      '/gvlab-dat/workspace/edit_metaid-'+metaid,
      '_blank' // <- This is what makes it open in a new window.
    );
  };

  render() {
    const { classes, name, metaid } = this.props;
    const self_view = this;
    return (
        <Dialog
          classes={{
            paperScrollPaper: classes.paperSP,
          }}
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth={true}
          maxWidth='xl'
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle classes={{
            root: classes.rootTitle,
          }}
          id="alert-dialog-title"><div className={classes.text}>{"Review: "+name}</div></DialogTitle>
          <DialogContent id="cvcontainer" classes={{
            root: classes.secondcontainer,
            }}>   
              <canvas id="canvas" className={classes.canvas}></canvas>
          </DialogContent>
          <DialogActions>
            <Button onClick={function(e){self_view.handleEdit(metaid)}} color="primary">
              Edit
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
    );
  }
}

AlertDialogView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AlertDialogView);