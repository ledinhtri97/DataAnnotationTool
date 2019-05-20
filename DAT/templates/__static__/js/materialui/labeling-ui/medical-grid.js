import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

//https://github.com/cornerstonejs/react-cornerstone-viewport/blob/master/example/src/App.js
import './initCornerstone';
import cornerstone from 'cornerstone-core';
import CornerstoneViewport from 'react-cornerstone-viewport'
import cornerstoneTools from 'cornerstone-tools';

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

    const exampleData = {
        stack: {
            currentImageIdIndex: 0,
            imageIds: [
            "dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
            "dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm"
            ],
        }
    }

    var medicalGridContainer = document.getElementById("labeling");
    var grid_width = medicalGridContainer.clientWidth / 2;
    var grid_height = medicalGridContainer.clientHeight / 2;

    return (
        <Grid item xs={6} className={classes.griditem} style={{padding: "1px"}}>
            <div style={{float: this.props.data.float_position, height: grid_height+'px', width: grid_width+'px'}}>
                {/*<canvas id={this.props.data.canvas_id}></canvas>*/}
                <CornerstoneViewport viewportData={exampleData}
                    cornerstone={cornerstone} 
                    cornerstoneTools={cornerstoneTools}
                    style={{width: "100%"}}/>
            </div>   
        </Grid>
    );
  }
}

MedicalGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedicalGrid);
