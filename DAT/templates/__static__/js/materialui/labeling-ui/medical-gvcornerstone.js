import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

//https://github.com/cornerstonejs/react-cornerstone-viewport/blob/master/example/src/App.js
import './initCornerstone';
import cornerstone from 'cornerstone-core';
import CornerstoneViewport from 'react-cornerstone-viewport'
import cornerstoneTools from 'cornerstone-tools';

import GVMedicalOverlay from './medical-overlay';

const styles = theme => ({
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
    // adjust
    if (canvas_xmax < canvas_xmin) {
        var tmp = canvas_xmin;
        canvas_xmin = canvas_xmax;
        canvas_xmax = tmp;
    }

    if (canvas_ymax < canvas_ymin) {
        var tmp = canvas_ymin;
        canvas_ymin = canvas_ymax;
        canvas_ymax = tmp;
    }

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

class GVCornerStone2 extends React.Component {

    canvas_id = "canvas_0";            // default index
    cornerstone_image = null;
    original_total_items = 1;           // store original value, using when state.total_items is changed to show full-screen
    state = {
        total_items: 1,
        url: "",
    };

    constructor(props) {
        super(props);
        this.canvas_id = "canvas_" + this.props.idx;
        this.original_total_items = this.props.total_items;
        this.state = {
            total_items: this.props.total_items,
            url: this.props.url
        };
    }
  
    // init activity
    load_dicom_and_visualize = () => {
        if (this.state.url != "") {
            console.log("load_dicom_and_visualize().url");
            console.log(this.state.url);
            cornerstone.loadAndCacheImage(this.state.url).then(image => {
                console.log("load_dicom_and_visualize().image");
                console.log(image);
                this.cornerstone_image = image;
                this.visualize();
            });
        } else {
            this.cornerstone_image = null;
        }
    }

    visualize = (canvas_xmin, canvas_ymin, canvas_xmax, canvas_ymax) => {
        /* default params */
        canvas_xmin = (typeof canvas_xmin == "undefined") ? -1 : canvas_xmin;
        canvas_ymin = (typeof canvas_ymin == "undefined") ? -1 : canvas_ymin;
        canvas_xmax = (typeof canvas_xmax == "undefined") ? -1 : canvas_xmax;
        canvas_ymax = (typeof canvas_ymax == "undefined") ? -1 : canvas_ymax;
        const cornerstone_image = this.cornerstone_image;
        const canvas_id = this.canvas_id;

        if (cornerstone_image == null) {
            return;
        }

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

    tunnel_set_total_items = (new_total_items) => {
        new_total_items = (typeof new_total_items != "undefined") ? new_total_items : this.original_total_items;
        this.setState({
            total_items: new_total_items,
        });        
    }

    // 20190527
    tunnel_region_growing = (canvas_x, canvas_y, delta) => {
        delta = (typeof delta == "undefined")?15:delta;

        // get pixel intensity on canvas
        let canvas = document.getElementById(this.canvas_id);
        var context = canvas.getContext("2d");

        // Get the CanvasPixelArray from the given coordinates and dimensions.
        var image_data = context.getImageData(0, 0, canvas.width, canvas.height);
        var pix = image_data.data;

        var to_loc1d = (x, y) => (y*canvas.width+x)*4;
        var is_valid_xy = (x, y) => x>=0 && y>=0 && x<canvas.width && y<canvas.height;

        const loc_1d = to_loc1d(canvas_x, canvas_y);
        const red = pix[loc_1d];
        const green = pix[loc_1d+1];
        const blue = pix[loc_1d+2];

        var neighbors = [];
        neighbors.push({x: canvas_x, y: canvas_y});
        var traversed_loc1d = [];
        var cvmask = (typeof cv !== 'undefined')?new cv.Mat(canvas.height, canvas.width, cv.CV_8U, new cv.Scalar(0)):null;

        var region = [];
        var loop_counting = 0;
        while (neighbors.length != 0) {
            var pixel = neighbors.shift();
            var n_xy1d = to_loc1d(pixel.x, pixel.y);
            var n_red = pix[n_xy1d];
            var n_green = pix[n_xy1d+1];
            var n_blue = pix[n_xy1d+2];
            if (Math.abs(red-n_red)<delta && Math.abs(green-n_green)<delta && Math.abs(blue-n_blue)<delta) {
                // 3x3 region
                var current_region = [
                    /*{x: pixel.x, y: pixel.y-1}, // top
                    {x: pixel.x-1, y: pixel.y-1}, // top left
                    {x: pixel.x+1, y: pixel.y-1}, // top right
                    {x: pixel.x-1, y: pixel.y}, // left*/
                    {x: pixel.x, y: pixel.y},   // center
                    /*{x: pixel.x+1, y: pixel.y}, // right
                    {x: pixel.x-1, y: pixel.y+1}, // bottom left 
                    {x: pixel.x, y: pixel.y+1}, // bottom
                    {x: pixel.x+1, y: pixel.y+1}, // bottom right*/
                ];

                for (var cr=0; cr<current_region.length; cr++) {
                    var current_pos = current_region[cr];
                    var pos_1d = to_loc1d(current_pos.x, current_pos.y);
                    if (is_valid_xy(current_pos.x, current_pos.y)) {
                        region.push({x: current_pos.x, y: current_pos.y});
                        traversed_loc1d.push(pos_1d);
                        cvmask.data[pos_1d/4] = 255;
                    }
                }

                const adj_delta = 1;
                var adj_positions = [
                    {x: pixel.x, y: pixel.y-adj_delta}, // top
                    {x: pixel.x-adj_delta, y: pixel.y-adj_delta}, // top left
                    {x: pixel.x+adj_delta, y: pixel.y-adj_delta}, // top right
                    {x: pixel.x-adj_delta, y: pixel.y}, // left
                    {x: pixel.x+adj_delta, y: pixel.y}, // right
                    {x: pixel.x-adj_delta, y: pixel.y+adj_delta}, // bottom left 
                    {x: pixel.x, y: pixel.y+adj_delta}, // bottom
                    {x: pixel.x+adj_delta, y: pixel.y+adj_delta}, // bottom right
                ];

                for (var ap=0; ap<adj_positions.length; ap++) {
                    var pos = adj_positions[ap];
                    var pos_1d = to_loc1d(pos.x, pos.y);

                    var is_traversed = false;
                    if (cvmask) {
                        is_traversed = (cvmask.data[pos_1d/4]>0)?true:false;
                    } else {
                        is_traversed = (traversed_loc1d.indexOf(pos_1d)<0 || traversed_loc1d.indexOf(pos_1d)>=traversed_loc1d.length)?false:true;
                    }

                    if (is_valid_xy(pos.x, pos.y) && !is_traversed) {
                        neighbors.push({x: pos.x, y: pos.y});
                        traversed_loc1d.push(pos_1d);
                        if (cvmask) {
                            // https://docs.opencv.org/trunk/de/d06/tutorial_js_basic_ops.html
                            cvmask.data[pos_1d/4] = 255;
                        }
                    }
                }
              /*
              region.push({x: pixel.x, y: pixel.y});
              // add 8-adjacent pixels
              var adj_positions = [
                  {x: pixel.x, y: pixel.y-1}, // top
                  {x: pixel.x-1, y: pixel.y-1}, // top left
                  {x: pixel.x+1, y: pixel.y-1}, // top right
                  {x: pixel.x-1, y: pixel.y}, // left
                  {x: pixel.x+1, y: pixel.y}, // right
                  {x: pixel.x-1, y: pixel.y+1}, // bottom left 
                  {x: pixel.x, y: pixel.y+1}, // bottom
                  {x: pixel.x+1, y: pixel.y+1}, // bottom right
              ];
              for (var ap=0; ap<adj_positions.length; ap++) {
                  var pos = adj_positions[ap];
                  var pos_1d = to_loc1d(pos.x, pos.y);

                  var is_traversed = false;
                  if (cvmask) {
                    is_traversed = (cvmask.data[pos_1d/4]>0)?true:false;
                  } else {
                    is_traversed = (traversed_loc1d.indexOf(pos_1d)<0 || traversed_loc1d.indexOf(pos_1d)>=traversed_loc1d.length)?false:true;
                  }

                  if (pos_1d>=0 && pos_1d<pix.length && !is_traversed) {
                      neighbors.push({x: pos.x, y: pos.y});
                      traversed_loc1d.push(pos_1d);
                      if (cvmask) {
                        // https://docs.opencv.org/trunk/de/d06/tutorial_js_basic_ops.html
                        cvmask.data[pos_1d/4] = 255;
                      }
                  }
              }  
              */     
            }
            loop_counting += 1;
        }

        if (cvmask) {
            let M = cv.Mat.ones(5, 5, cv.CV_8U);
            let anchor = new cv.Point(-1, -1);
            //cv.erode(cvmask, cvmask, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            cv.morphologyEx(cvmask, cvmask, cv.MORPH_OPEN, M, anchor, 1,
                cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            return {
                region: region,
                mask: cvmask,
            };

            /*console.log(cv.findNonZero(cvmask))
            cvmask.delete();*/
        }

        return {
            region: region,
            mask: null,
        }
    }

    render() {
        this.load_dicom_and_visualize();
        const xs_value = (this.state.total_items == 1) ? 12 : 6;
        var medicalGridContainer = document.getElementById("labeling");
        const canvas_width = ((this.state.total_items == 1)?medicalGridContainer.clientWidth:medicalGridContainer.clientWidth/2)*0.98;
        const canvas_height = ((this.state.total_items == 1)?medicalGridContainer.clientHeight:medicalGridContainer.clientHeight/2)*0.98;
        return (
            <Grid item xs={xs_value} style={{padding: "1px"}} className="griditem_container" id={"griditem_container-"+this.canvas_id}>
                <div style={{height: canvas_height+'px', width: canvas_width+'px'}}>
                    <div style={{position: "relative"}}>
                        <GVMedicalOverlay 
                            width={canvas_width} 
                            height={canvas_height}
                            canvas_id={"overlay-"+this.canvas_id}
                            original_canvas_id={this.canvas_id}
                            visualize={this.visualize}
                            tunnel_set_total_items={this.tunnel_set_total_items}
                            tunnel_region_growing={this.tunnel_region_growing}/>
                        <canvas className="cornerstone-canvas" 
                            width={canvas_width+"px"} 
                            height={canvas_height+"px"} 
                            style={{width: canvas_width+"px", height: canvas_height+"px"}}
                            id={this.canvas_id}
                            ></canvas>        
                    </div>
                </div>
            </Grid>
        )
    }
}

export default GVCornerStone2;
