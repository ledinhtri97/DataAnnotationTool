import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    height: 140,
    width: 100,
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
});

class MedicalGrid extends React.Component {
  state = {
    spacing: '8',
  };

  handleChange = key => (event, value) => {
    this.setState({
      [key]: value,
    });
  };

  render() {
    const { classes } = this.props;
    const { spacing } = this.state;

    return (
        <Grid item xs={6} className={classes.griditem}>
            <div style={{float: this.props.data.float}}>
                <canvas id={this.props.data.canvas_id}></canvas> 
            </div>   
        </Grid>
    );
  }
}

MedicalGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedicalGrid);
