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
import AlertDialog from '../dialog';

import GVMedicalOverlay from './medical-overlay';

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

function voxel_to_pixel(cornerstone_image, lookup_table, canvas_width, canvas_height, canvas_xmin, canvas_ymin, canvas_xmax, canvas_ymax) {
  /*
    canvas_width: pixel
    canvas_height: pixel
    xmin, ymin, xmax, ymax: absolute
  */
  const image = cornerstone_image;
  // https://github.com/cornerstonejs/cornerstone/blob/master/src/enabledElements.js
  const voxel_data = image.getPixelData();
  const min_voxel_value = image.minPixelValue;
  const max_voxel_value = image.maxPixelValue;
  const slope = image.slope;  // scale
  const intercept = image.intercept;
  var height = image.height;
  var width = image.width;

  // https://www.w3schools.com/Tags/canvas_imagedata_data.asp
  var tmp_canvas = document.createElement('canvas');
  tmp_canvas.width  = width;
  tmp_canvas.height = height;
  var tmp_ctx = tmp_canvas.getContext("2d");        
  var imageData = tmp_ctx.createImageData(width, height);

  const is_use_loopup_table = typeof lookup_table != "undefined";

  if (is_use_loopup_table) {
    console.log("Using lookup table!");
  }

  for (var i = 0; i < imageData.data.length; i += 4) {
    const voxel_idx = Math.ceil((i/4));

    var pv;
    if (is_use_loopup_table) {
      pv = lookup_table[voxel_data[voxel_idx]*slope+intercept]; // original voxel data (may contains negative values)
    } else {
      pv = Math.ceil(voxel_data[voxel_idx]/max_voxel_value*255);
    }

    imageData.data[i+0] = pv;
    imageData.data[i+1] = pv;
    imageData.data[i+2] = pv;
    imageData.data[i+3] = 255;
  }
  tmp_ctx.putImageData(imageData, 0, 0); // (image-data, x, y)

  let voxel_mat = cv.imread(tmp_canvas); // 512 x 512

  width = voxel_mat.cols;
  height = voxel_mat.rows;

  // calculate ideal ratio which is fit with the canvas size
  var final_scale = 1.0;
  var scale_by_width = canvas_width / width;
  var scale_by_height = canvas_height / height;
  if (width*scale_by_width <= canvas_width && height*scale_by_width <= canvas_height) {
    final_scale = scale_by_width;
  } else {
    final_scale = scale_by_height;
  }

  if (canvas_xmin != -1 || canvas_ymin != -1 || canvas_xmax != -1 || canvas_ymax != -1) {
    var xmin = (canvas_xmin - (canvas_width - final_scale*width)/2)/(final_scale*width);
    var ymin = (canvas_ymin - (canvas_height - final_scale*height)/2)/(final_scale*height);
    var xmax = (canvas_xmax - (canvas_width - final_scale*width)/2)/(final_scale*width);
    var ymax = (canvas_ymax - (canvas_height - final_scale*height)/2)/(final_scale*height);
    xmin = (xmin<0)?0:xmin;
    ymin = (ymin<0)?0:ymin;
    xmax = (xmax>1)?1:xmax;
    ymax = (ymax>1)?1:ymax;

    // crop by xmin, ymin, xmax, ymax
    if (xmin != 0 || ymin != 0 || xmax != 1 || ymax != 1) { // different from default values
      let rect = new cv.Rect(xmin*voxel_mat.cols, ymin*voxel_mat.rows, xmax*voxel_mat.cols-xmin*voxel_mat.cols, ymax*voxel_mat.rows-ymin*voxel_mat.rows);
      voxel_mat = voxel_mat.roi(rect);

      // re-calculate final_scale
      final_scale = 1.0;
      scale_by_width = canvas_width / voxel_mat.cols;
      scale_by_height = canvas_height / voxel_mat.rows;
      if (voxel_mat.cols*scale_by_width <= canvas_width && voxel_mat.rows*scale_by_width <= canvas_height) {
        final_scale = scale_by_width;
      } else {
        final_scale = scale_by_height;
      }

    }
  }

  if (final_scale != 1.0) {
    let dsize = new cv.Size(voxel_mat.cols*final_scale, voxel_mat.rows*final_scale);
    cv.resize(voxel_mat, voxel_mat, dsize, 0, 0, cv.INTER_AREA);
  }

  let imgData = new ImageData(new Uint8ClampedArray(voxel_mat.data, voxel_mat.cols, voxel_mat.rows), voxel_mat.cols, voxel_mat.rows);
  voxel_mat.delete();
  return imgData;
}  

function calc_mean_std_from_voxel_array(voxel_array_1d, slope, intercept) {
  // https://stackoverflow.com/questions/7343890/standard-deviation-javascript
  var n = voxel_array_1d.length;
  var total = 0;
  for(var i=0; i<n; i++) {
    total += voxel_array_1d[i]*slope+intercept;
  }
  var mean = total/n;
  var total2 = 0;
  for(var i=0; i<n; i++) {
    total2 += Math.pow(voxel_array_1d[i]*slope+intercept-mean, 2)
  }
  var std = Math.sqrt(total2/n);

  return {
    mean: mean,
    std: std
  }
}

class GVCornerstone extends React.Component {
  data = {
    cornerstone_image: null,
    ct_image_canvas_id: null,
  };
  
  // init activity
  load_dicom_and_visualize = () => {
    cornerstone.loadAndCacheImage(this.props.dicom_data.imageId).then(image => {
      this.data.cornerstone_image = image;
      this.data.ct_image_canvas_id = this.props.gvcanvas.canvas_id;
      this.visualize();
    });
  }

  visualize = (canvas_xmin, canvas_ymin, canvas_xmax, canvas_ymax) => {
    /* default params */
    canvas_xmin = (typeof canvas_xmin == "undefined") ? -1 : canvas_xmin;
    canvas_ymin = (typeof canvas_ymin == "undefined") ? -1 : canvas_ymin;
    canvas_xmax = (typeof canvas_xmax == "undefined") ? -1 : canvas_xmax;
    canvas_ymax = (typeof canvas_ymax == "undefined") ? -1 : canvas_ymax;
    /*cornerstone_image = (typeof cornerstone_image == "undefined") ? this.state.cornerstone_image : cornerstone_image;
    canvas_id = (typeof canvas_id == "undefined") ? this.state.ct_image_canvas_id : canvas_id;*/
    const cornerstone_image = this.data.cornerstone_image;
    const canvas_id = this.data.ct_image_canvas_id;

    wait_opencvjs_to_exec(function(data) {
      const image = data.cornerstone_image;
      const min_voxel_value = image.minPixelValue;
      const max_voxel_value = image.maxPixelValue;
      const slope = image.slope;  // scale
      const intercept = image.intercept;
      let canvas = document.getElementById(data.canvas_id);

      // generate lookup table
      var lookup_table = {}
      for(var i=min_voxel_value; i<max_voxel_value; i++) {
        if (data.canvas_id == "canvas_1") {
          lookup_table[i*slope+intercept] = Math.log(Math.ceil(i/max_voxel_value*255)+1)/Math.log(256)*255; // apply log function
        } else {
          lookup_table[i*slope+intercept] = Math.ceil(i/max_voxel_value*255);
        }   
      }      

      let imgData = voxel_to_pixel(data.cornerstone_image, lookup_table, canvas.width, canvas.height, data.canvas_xmin, data.canvas_ymin, data.canvas_xmax, data.canvas_ymax);        
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // fill black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // fill in CT image
      ctx.putImageData(imgData, canvas.width/2-imgData.width/2, canvas.height/2-imgData.height/2);

      /*
        // Hounsfield mean +- std
        const hounsfield_info = calc_mean_std_from_voxel_array(data.cornerstone_image.getPixelData(), data.cornerstone_image.slope, data.cornerstone_image.intercept);
        ctx.font = "1em Arial";
        ctx.fillStyle = "orange";
        ctx.fillText("Hounsfield: " + hounsfield_info.mean.toFixed(0) + " ± " + hounsfield_info.std.toFixed(0), Math.ceil(canvas.width*0.03), Math.ceil(canvas.height*0.08));
      */
    }, {
      canvas_id: canvas_id,
      cornerstone_image: cornerstone_image,
      canvas_xmin: canvas_xmin,
      canvas_ymin: canvas_ymin,
      canvas_xmax: canvas_xmax,
      canvas_ymax: canvas_ymax,
    });
  }

  render() {
    this.load_dicom_and_visualize();
    return (
      <div style={{position: "relative", cursor: "crosshair"}}>
        <GVMedicalOverlay 
          width={this.props.canvas_size.width} 
          height={this.props.canvas_size.height}
          canvas_id={"overlay-"+this.props.gvcanvas.canvas_id}
          original_canvas_id={this.props.gvcanvas.canvas_id}
          visualize={this.visualize}/>
        <canvas className="cornerstone-canvas" 
          width={this.props.canvas_size.width+"px"} 
          height={this.props.canvas_size.height+"px"} 
          style={{width: this.props.canvas_size.width+"px", height: this.props.canvas_size.height+"px"}}
          id={this.props.gvcanvas.canvas_id}
        ></canvas>        
      </div>
    )
  }
}

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
   
    const gvcanvas_obj = {
      canvas_id: this.props.data.canvas_id
    }

    const dicom_data = {
      imageId: "dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm"
    }

    const csize = {
      width: grid_width,
      height: grid_height
    }

    return (
          <Grid item xs={6} className={classes.griditem} style={{padding: "1px"}}>
              <div style={{float: this.props.data.float_position, height: grid_height+'px', width: grid_width+'px'}}>
                  <GVCornerstone dicom_data={dicom_data}
                    cornerstone={cornerstone}
                    gvcanvas={gvcanvas_obj}
                    canvas_size={csize} />
              </div>   
          </Grid>
    );
  }
}

MedicalGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedicalGrid);
