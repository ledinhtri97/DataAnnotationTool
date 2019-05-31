import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

//https://github.com/cornerstonejs/react-cornerstone-viewport/blob/master/example/src/App.js
import './initCornerstone';
import cornerstone from 'cornerstone-core';
import CornerstoneViewport from 'react-cornerstone-viewport'
import cornerstoneTools from 'cornerstone-tools';

import MedicalImageProcessingBox from './medical-image-processing-box';
import GVMedicalOverlay from './medical-overlay';

const ipbox = new MedicalImageProcessingBox();

const styles = theme => ({
});

function voxel_to_pixel(cornerstone_image, lookup_table, canvas_width, canvas_height, x_min, y_min, x_max, y_max) {
    /*
        canvas_width: pixel
        canvas_height: pixel
        xmin, ymin, xmax, ymax: relative (%)
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

    const is_use_loopup_table = lookup_table != null;
    if (is_use_loopup_table) {
        //console.log("Using lookup table!");
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
    let intensity_image_ori_size = voxel_mat.clone();

    voxel_mat = MedicalImageProcessingBox.ROI(voxel_mat, x_min, y_min, x_max, y_max);
    voxel_mat = MedicalImageProcessingBox.fit(voxel_mat, canvas_width, canvas_height);

    let imgData = new ImageData(new Uint8ClampedArray(voxel_mat.data, voxel_mat.cols, voxel_mat.rows), voxel_mat.cols, voxel_mat.rows);
    voxel_mat.delete();
    return {
        image_data: imgData,
        intensity_image_ori_size: intensity_image_ori_size,
    };
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
    original_total_items = 1;           // store original value, using when state.total_items is changed to show full-screen
    canvas_id = "canvas_0";            // default index

    medical_images = [{
        url: "",
        cornerstone_image: null,
        lookup_table: null,    // mapping between housnfield & intensity
        intensity_image: null,
        labeling_mask: {},    // dict of cv.Mat()
    }];

    vis_meta = {
        viewing_image_width_px: -1,
        viewing_image_height_px: -1,
        viewing_canvas_width_px: -1,
        viewing_canvas_height_px: -1,
    }
    
    state = {
        total_items: 1,
        active_idx: 0,
        lookup_table: null,
        zoom_xmin: 0.0,
        zoom_ymin: 0.0,
        zoom_xmax: 1.0,
        zoom_ymax: 1.0,
    };

    visualize_callback = null;

    constructor(props) {
        super(props);
        this.canvas_id = "canvas_" + this.props.idx;
        this.original_total_items = this.props.total_items;

        var default_medical_instance = this.medical_images[0];
        this.medical_images = [];
        for(var i=0; i<this.props.urls.length; i++) {
            this.medical_images.push({
                url: this.props.urls[i],
                cornerstone_image: default_medical_instance.cornerstone_image,
                lookup_table: default_medical_instance.lookup_table,
                intensity_image: default_medical_instance.intensity_image,
                labeling_mask: default_medical_instance.labeling_mask
            });
        }

        this.state = {
            total_items: this.props.total_items,
            active_idx: this.props.active_idx,
            lookup_table: this.medical_images[this.props.active_idx].lookup_table,
            zoom_xmin: 0.0,
            zoom_ymin: 0.0,
            zoom_xmax: 1.0,
            zoom_ymax: 1.0,
        };
    }

    // init activity
    load_dicom_and_visualize = () => {
        var dicom_url = this.medical_images[this.state.active_idx].url;
        if (dicom_url != "") {
            if (this.medical_images[this.state.active_idx].cornerstone_image == null) {
                console.log("Load " + dicom_url + " via network!")
                cornerstone.loadAndCacheImage(dicom_url).then(image => { // async calling
                    this.medical_images[this.state.active_idx].cornerstone_image = image;
                    this.visualize();
                });
            } else {
                console.log("Use cached medical image!");
                console.log(this.medical_images[this.state.active_idx].cornerstone_image);
                this.visualize();
            }            
        } else {
            this.medical_images[this.state.active_idx].cornerstone_image = null;
        }
    }

    visualize = () => {
        var cornerstone_image = this.medical_images[this.state.active_idx].cornerstone_image;
        if (cornerstone_image == null) {
            return;
        }

        console.log("Call visualize(): Zoom: [" + this.state.zoom_xmin + ", " + 
            this.state.zoom_ymin + ", " + this.state.zoom_xmax + ", " + this.state.zoom_ymax + "]");

        const result = wait_opencvjs_to_exec(function(data) {
            const image = data.cornerstone_image;
            const min_voxel_value = image.minPixelValue;
            const max_voxel_value = image.maxPixelValue;
            const slope = image.slope;  // scale
            const intercept = image.intercept;
            let canvas = document.getElementById(data.canvas_id);

            const lookup_table = data.lookup_table;
            let vtp_result = voxel_to_pixel(data.cornerstone_image, lookup_table, canvas.width, canvas.height, data.xmin, data.ymin, data.xmax, data.ymax);        
            let imgData = vtp_result.image_data;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // fill black background
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // fill in CT image
            ctx.putImageData(imgData, canvas.width/2-imgData.width/2, canvas.height/2-imgData.height/2);

            //console.log("Going to update vis meta");

            if (data.self.medical_images[data.self.state.active_idx].intensity_image != null) {
                data.self.medical_images[data.self.state.active_idx].intensity_image.delete();
                data.self.medical_images[data.self.state.active_idx].intensity_image = null;
            }
            data.self.medical_images[data.self.state.active_idx].intensity_image = vtp_result.intensity_image_ori_size;

            data.self.vis_meta.viewing_image_width_px = imgData.width;
            data.self.vis_meta.viewing_image_height_px = imgData.height;
            data.self.vis_meta.viewing_canvas_width_px = canvas.width;
            data.self.vis_meta.viewing_canvas_height_px = canvas.height;

            /*
            // Hounsfield mean +- std
            const hounsfield_info = calc_mean_std_from_voxel_array(data.cornerstone_image.getPixelData(), data.cornerstone_image.slope, data.cornerstone_image.intercept);
            ctx.font = "1em Arial";
            ctx.fillStyle = "orange";
            ctx.fillText("Hounsfield: " + hounsfield_info.mean.toFixed(0) + " ± " + hounsfield_info.std.toFixed(0), Math.ceil(canvas.width*0.03), Math.ceil(canvas.height*0.08));
            */
            return "OK";

            }, {
                canvas_id: this.canvas_id,
                cornerstone_image: cornerstone_image,
                lookup_table: this.state.lookup_table,
                xmin: this.state.zoom_xmin,
                ymin: this.state.zoom_ymin,
                xmax: this.state.zoom_xmax,
                ymax: this.state.zoom_ymax,
                self: this,
            }
        );

        if (this.visualize_callback != null) {
            this.visualize_callback();
        }
    }

    tunnel_retrieve_medical_images = () => {
        return this.medical_images;
    }

    tunnel_retrieve_state = () => {
        return this.state;
    }

    tunnel_retrieve_vis_meta = () => {
        return this.vis_meta;
    }

    tunnel_set_total_items = (new_total_items) => {
        new_total_items = (typeof new_total_items != "undefined") ? new_total_items : this.original_total_items;
        this.setState({
            total_items: new_total_items,
        });        
    }

    tunnel_register_visualize_callback = (mycallback) => {
        this.visualize_callback = mycallback;
    }

    tunnel_set_zoom_area = (xmin, ymin, xmax, ymax) => {
        /*
            xmin, ymin, xmax, ymax: relative coords (%)
        */
        // adjust
        if (xmax < xmin) {
            var tmp = xmin;
            xmin = xmax;
            xmax = tmp;
        }

        if (ymax < ymin) {
            var tmp = ymin;
            ymin = ymax;
            ymax = tmp;
        }
        
        xmin = (xmin<0)?0:xmin;
        ymin = (ymin<0)?0:ymin;
        xmax = (xmax>1)?1:xmax;
        ymax = (ymax>1)?1:ymax;

        if (this.state.xmin != xmin || this.state.ymin != ymin || this.state.xmax != xmax || this.state.ymax != ymax) {
            this.setState({
                zoom_xmin: xmin,
                zoom_ymin: ymin,
                zoom_xmax: xmax,
                zoom_ymax: ymax
            });
        }
    }

    // 20190527
    tunnel_region_growing = (x_percent, y_percent, delta) => {
        return wait_opencvjs_to_exec(function(data) {
            const x_percent = data.x_percent;
            const y_percent = data.y_percent;
            var delta = data.delta;
            const self = data.self;

            delta = (typeof delta == "undefined")?15:delta;

            const cvimg = self.medical_images[self.state.active_idx].intensity_image;
            const x_abs = Math.floor(x_percent*cvimg.cols);
            const y_abs = Math.floor(y_percent*cvimg.rows);
    
            console.log(x_percent);
            console.log(y_percent);
    
            var pix = cvimg.data;
    
            var to_loc1d = (x, y) => (y*cvimg.cols+x)*4;
            var is_valid_xy = (x, y) => x>=0 && y>=0 && x<cvimg.cols && y<cvimg.rows;
    
            const loc_1d = to_loc1d(x_abs, y_abs);
            const red = pix[loc_1d];
            const green = pix[loc_1d+1];
            const blue = pix[loc_1d+2];
    
            var neighbors = [];
            neighbors.push({x: x_abs, y: y_abs});
            var cvmask = new cv.Mat(cvimg.rows, cvimg.cols, cv.CV_8U, new cv.Scalar(0));
    
            //var region = [];
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
                            //region.push({x: current_pos.x, y: current_pos.y});
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
    
                        var is_traversed = (cvmask.data[pos_1d/4]>0)?true:false;
    
                        if (is_valid_xy(pos.x, pos.y) && !is_traversed) {
                            neighbors.push({x: pos.x, y: pos.y});
                            // https://docs.opencv.org/trunk/de/d06/tutorial_js_basic_ops.html
                            cvmask.data[pos_1d/4] = 255;
                        }
                    }
                }
                loop_counting += 1;
            }
    
            let M = cv.Mat.ones(5, 5, cv.CV_8U);
            let anchor = new cv.Point(-1, -1);
            //cv.erode(cvmask, cvmask, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            cv.morphologyEx(cvmask, cvmask, cv.MORPH_OPEN, M, anchor, 1,
                cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            /*return {
                region: region,
                mask: cvmask,
            };*/

            const label_id = self.props.medical_label_state.labelId;
            self.medical_images[self.state.active_idx].labeling_mask[label_id] = cvmask;
            return cvmask.clone();
        }, {
            x_percent: x_percent,
            y_percent: y_percent,
            delta: delta,
            self: this
        });
    }

    componentDidMount = () => {
        this.load_dicom_and_visualize();
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        this.load_dicom_and_visualize();
    }

    render() {        
        const xs_value = (this.state.total_items == 1) ? 12 : 6;
        var medicalGridContainer = document.getElementById("labeling");
        const canvas_width = ((this.state.total_items == 1)?medicalGridContainer.clientWidth:medicalGridContainer.clientWidth/2)*0.98;
        const canvas_height = ((this.state.total_items == 1)?medicalGridContainer.clientHeight:medicalGridContainer.clientHeight/2)*0.98;
        
        console.log("medical-gvcornerstone > render()");
        
        return (
            <Grid item xs={xs_value} style={{padding: "1px"}} className="griditem_container" id={"griditem_container-"+this.canvas_id}>
                <div style={{height: canvas_height+'px', width: canvas_width+'px'}}>
                    <div style={{position: "relative"}}>
                        <GVMedicalOverlay 
                            width={canvas_width} 
                            height={canvas_height}
                            canvas_id={"overlay-"+this.canvas_id}
                            original_canvas_id={this.canvas_id}
                            tunnel_set_total_items={this.tunnel_set_total_items}
                            tunnel_region_growing={this.tunnel_region_growing}
                            tunnel_retrieve_state={this.tunnel_retrieve_state}
                            tunnel_retrieve_medical_images={this.tunnel_retrieve_medical_images}
                            tunnel_retrieve_vis_meta={this.tunnel_retrieve_vis_meta}
                            tunnel_set_zoom_area={this.tunnel_set_zoom_area}
                            tunnel_register_visualize_callback={this.tunnel_register_visualize_callback}
                            total_items={this.state.total_items}
                            medical_label_state={this.props.medical_label_state}/>
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
