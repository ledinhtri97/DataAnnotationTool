import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const styles = theme =>({
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: theme.spacing.unit,
  },
});


class AlertDialogChangeClass extends React.Component {
  state = {
    open: true,
  };

  handleClose = (event) => {
    // alert(event.target.value);
    if(event.target.value){
      let values = event.target.value.split(',');

      let res = this.props.labelControl.__changeClass__(values[0], values[1], values[2]);//lb.tag_label+','+lb.type_label+','+lb.color;
      
      if (res){
        this.setState({ open: false });
        this.props.callSetName(values[0]); //dig
      }
      else{
        alert("Cannot change different type of shape");
      }
    }
    else{
      this.setState({ open: false });
    }
  };

  render() {

    const selfForm = this;
    const { classes, labelControl} = this.props;

    let lbs = document.getElementById('label_select');
    let label_select = JSON.parse(lbs.textContent).label_select;

    return (
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Data Annotation Tool - GVlab"}</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Change class label</FormLabel>
              <RadioGroup
                aria-label="Change class label"
                name="changeclass"
                className={classes.group}
                value={labelControl.getValueClass()}
                onChange={function(e){selfForm.handleClose(e)}}
              >
              { 
              label_select.map(function(lb) {
                let labelname = lb.tag_label.charAt(0).toUpperCase() + lb.tag_label.slice(1);
                let labeltype = lb.type_label.charAt(0).toUpperCase() + lb.type_label.slice(1);
                let id = lb.tag_label+','+lb.type_label+','+lb.color;
                return (
                    <FormControlLabel key={lb.id} value={id} control={<Radio color="primary"/>} label={labelname + ' | ' +labeltype} />
                  );}
              )
            }

              </RadioGroup>
            </FormControl>
          </DialogContent>
        </Dialog>
    );
  }
}

AlertDialogChangeClass.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AlertDialogChangeClass);