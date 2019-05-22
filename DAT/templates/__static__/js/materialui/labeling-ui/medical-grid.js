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

function voxel_to_pixel(cornerstone_image, new_size, lookup_table) {
  const image = cornerstone_image;
  // https://github.com/cornerstonejs/cornerstone/blob/master/src/enabledElements.js
  const voxel_data = image.getPixelData();
  const min_voxel_value = image.minPixelValue;
  const max_voxel_value = image.maxPixelValue;
  const slope = image.slope;  // scale
  const intercept = image.intercept;
  const height = image.height;
  const width = image.width;

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

  let voxel_mat = cv.imread(tmp_canvas);
  if (new_size > 0) {
    let dsize = new cv.Size(new_size, new_size);
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
    total += voxel_array_1d[i];
  }
  //var mean = voxel_array_1d.reduce((a,b) => (a*slope+intercept)+(b*slope+intercept))/n;
  var mean = total/n;

  var total2 = 0;
  for(var i=0; i<n; i++) {
    total2 += Math.pow(voxel_array_1d[i]-mean, 2)
  }
  var std = Math.sqrt(total2/n);

  //var std = Math.sqrt(voxel_array_1d.map(x => Math.pow(x-mean,2)).reduce((a,b) => a+b)/n);
  return {
    mean: mean,
    std: std
  }
}

class GVCornerstone extends React.Component {
  load_dicom_and_visualize = () => {
    cornerstone.loadAndCacheImage(this.props.dicom_data.imageId).then(image => {        

      let canvas = document.getElementById(this.props.gvcanvas.canvas_id).getElementsByTagName("canvas")[0];

      wait_opencvjs_to_exec(function(data) {
        const image = data.cornerstone_image;
        const min_voxel_value = image.minPixelValue;
        const max_voxel_value = image.maxPixelValue;
        const slope = image.slope;  // scale
        const intercept = image.intercept;

        // generate lookup table
        var lookup_table = {}
        for(var i=min_voxel_value; i<max_voxel_value; i++) {
          if (data.canvas_id_string == "canvas_1") {
            lookup_table[i*slope+intercept] = Math.log(Math.ceil(i/max_voxel_value*255)+1)/Math.log(256)*255; // apply log function
          } else {
            lookup_table[i*slope+intercept] = Math.ceil(i/max_voxel_value*255);
          }   
        }

        const new_size = data.canvas.width < data.canvas.height ? data.canvas.width: data.canvas.height;

        let imgData = voxel_to_pixel(data.cornerstone_image, new_size, lookup_table);        
        const ctx = data.canvas.getContext("2d");
        ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);

        // fill black background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, data.canvas.width, data.canvas.height);

        // fill in CT image
        ctx.putImageData(imgData, data.canvas.width/2-imgData.width/2, data.canvas.height/2-imgData.height/2);

        // Hounsfield mean +- std
        const hounsfield_info = calc_mean_std_from_voxel_array(data.cornerstone_image.getPixelData(), data.cornerstone_image.slope, data.cornerstone_image.intercept);
        ctx.font = "1em Arial";
        ctx.fillStyle = "orange";
        ctx.fillText("Hounsfield: " + hounsfield_info.mean.toFixed(0) + " ± " + hounsfield_info.std.toFixed(0), Math.ceil(data.canvas.width*0.03), Math.ceil(data.canvas.height*0.08));
      }, {
        canvas: canvas,
        canvas_id_string: this.props.gvcanvas.canvas_id,
        cornerstone_image: image
      });   

    });
  }

  render() {
    this.load_dicom_and_visualize();
    return (
      <canvas className="cornerstone-canvas" width={this.props.canvas_size.width+"px"} height={this.props.canvas_size.height+"px"} style={{width: this.props.canvas_size.width+"px", height: this.props.canvas_size.height+"px"}}></canvas>
    )
  }
}

class GVCornerstoneViewport extends CornerstoneViewport {
  my_opencv_process = () => {
    cornerstone.loadAndCacheImage("dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm").then(image => {        
      //console.log(image.getPixelData()); // house field values, sizes: 512 x 512
      //console.log(image.minPixelValue);
      //console.log(image.maxPixelValue);   

      let canvas = document.getElementById(this.props.gvcanvas.canvas_id).getElementsByTagName("canvas")[0];

      wait_opencvjs_to_exec(function(data) {
        const image = data.cornerstone_image;
        const min_voxel_value = image.minPixelValue;
        const max_voxel_value = image.maxPixelValue;
        const slope = image.slope;  // scale
        const intercept = image.intercept;

        // generate lookup table
        var lookup_table = {}
        for(var i=min_voxel_value; i<max_voxel_value; i++) {
          if (data.canvas_id_string == "canvas_1") {
            lookup_table[i*slope+intercept] = Math.log(Math.ceil(i/max_voxel_value*255)+1)/Math.log(256)*255; // apply log function
          } else {
            lookup_table[i*slope+intercept] = Math.ceil(i/max_voxel_value*255);
          }   
        }

        const new_size = data.canvas.width < data.canvas.height ? data.canvas.width: data.canvas.height;
        let imgData = voxel_to_pixel(data.cornerstone_image, new_size, lookup_table);        
        const ctx = data.canvas.getContext("2d");
        ctx.clearRect(0, 0, data.canvas.width, data.canvas.height)
        ctx.putImageData(imgData, data.canvas.width/2-imgData.width/2, data.canvas.height/2-imgData.height/2);

        // Hounsfield mean +- std
        const hounsfield_info = calc_mean_std_from_voxel_array(data.cornerstone_image.getPixelData(), data.cornerstone_image.slope, data.cornerstone_image.intercept);
        ctx.font = "1.5em Arial";
        //ctx.fillText("Hello World", 10, 50);
        ctx.fillStyle = "orange";
        ctx.fillText("Hounsfield: " + hounsfield_info.mean.toFixed(0) + " ± " + hounsfield_info.std.toFixed(0), data.canvas.width/6, data.canvas.height/3);

        console.log("Rendered using cv Mat!");
      }, {
        canvas: canvas,
        canvas_id_string: this.props.gvcanvas.canvas_id,
        cornerstone_image: image
      });   

    });
    
  };

  // https://github.com/cornerstonejs/react-cornerstone-viewport/blob/master/src/CornerstoneViewport/CornerstoneViewport.js#L520
  onImageLoaded = () => {    
    this.setState({
      numImagesLoaded: this.state.numImagesLoaded + 1
    });
    
    this.my_opencv_process();    
  };

  // updated (called) when user click (holding) and move on CornerStoneViewPort!
  onImageRendered = event => {
    this.setState({
      viewport: Object.assign({}, event.detail.viewport)
    });

    //this.my_opencv_process();
  };
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
              <div id={this.props.data.canvas_id} style={{float: this.props.data.float_position, height: grid_height+'px', width: grid_width+'px'}}>
                  {/*<canvas id={this.props.data.canvas_id}></canvas>*/}
                  {/*<GVCornerstoneViewport viewportData={exampleData}
                      cornerstone={cornerstone} 
                      cornerstoneTools={cornerstoneTools}
                      gvcanvas={gvcanvas_obj}
                      style={{width: "100%"}} />*/}
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
