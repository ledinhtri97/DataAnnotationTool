import React from 'react';
import Grid from '@material-ui/core/Grid';

//https://github.com/cornerstonejs/react-cornerstone-viewport/blob/master/example/src/App.js
import './initCornerstone';
import cornerstone from 'cornerstone-core';

import MedicalImageProcessingBox from './toolbox/medical_image_processing_box';
import MedicalChartBox from './toolbox/medical_chart_box';
import GVMedicalOverlay from './medical_overlay';

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
            const voxel_origin = voxel_data[voxel_idx]*slope+intercept;
            pv = (voxel_origin in lookup_table)?lookup_table[voxel_origin]:0; // original voxel data (may contains negative values)
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

    chart_data = {
        control_points: null,
        axis_ranges: null
    }

    medical_images = [{
        url: "",
        cornerstone_image: null,
        intensity_image: null,
        labeling_mask: null,    // dict of cv.Mat()
        predict: null,  // list of label predictions in this image
        groundtruth: null,
        /*
            predict: [{"label": "liver", "url": "http://..."}, {"label": "tumor", "url": "http://..."}]
        */
    }];

    labeling_mask_layers = [
        [{ label_id: -1,  mask: null }]
    ]; // these value will be reset in contructor

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
    medical_overlay_obj = null;

    constructor(props) {
        super(props);
        this.canvas_id = "canvas_" + this.props.idx;
        this.original_total_items = this.props.total_items;

        var default_medical_instance = this.medical_images[0];
        this.medical_images = [];
        this.labeling_mask_layers = []; // reset to empty list
        for(var i=0; i<this.props.urls.length; i++) {
            this.medical_images.push({
                url: this.props.urls[i],
                cornerstone_image: default_medical_instance.cornerstone_image,
                intensity_image: default_medical_instance.intensity_image,
                labeling_mask: default_medical_instance.labeling_mask,
                predict: this.props.predicts[i],
                groundtruth: default_medical_instance.groundtruth,
            });
            this.labeling_mask_layers.push([]);
        }

        var gen_lookup_table = null;
        if (this.chart_data.control_points != null && this.chart_data.axis_ranges != null) {
            const result = MedicalChartBox.generate_line_data(this.chart_data.control_points, 
                this.chart_data.axis_ranges.xmin, 
                this.chart_data.axis_ranges.xmax, 
                this.chart_data.axis_ranges.ymin,
                this.chart_data.axis_ranges.ymax);            
            gen_lookup_table = result.lookup_table;
        }

        this.state = {
            total_items: this.props.total_items,
            active_idx: this.props.active_idx,
            lookup_table: gen_lookup_table,
            zoom_xmin: 0.0,
            zoom_ymin: 0.0,
            zoom_xmax: 1.0,
            zoom_ymax: 1.0,
        };

        props.medical_label_state.register_label_selected_callback(this.canvas_id, this.label_selected_callback);
        props.medical_label_state.register_next_slice_callback(this.canvas_id, this.next_slice_callback);
        props.medical_label_state.register_prev_slice_callback(this.canvas_id, this.prev_slice_callback);
        props.medical_label_state.register_go_to_slice_callback(this.canvas_id, this.go_to_slice_callback);
        props.medical_label_state.register_copy_chart_to_slice_callback(this.canvas_id, this.set_lookup_table);
        props.medical_label_state.register_medical_gvcornerstone(this.canvas_id, this)
        props.medical_label_state.register_boundary_mode_callback(this.canvas_id, this.boundary_mode_callback);
    }

    label_selected_callback = () => {
        if (this.medical_overlay_obj != null) {
            this.medical_overlay_obj.draw_mask();
        }
        this.medical_overlay_obj.label_selected();
    }

    next_slice_callback = () => {
        const current_active_idx = this.state.active_idx;

        // save mask to server
        // http://172.28.182.144:8011/groundtruth/upload/
        /*
        {
            "seri_id": "1.3.12.2.1107.5.1.4.66711.30000018110100213625600167239",
            "gt_file_name": "1.3.12.2.1107.5.1.4.66711.30000018110100213625600167239.png",
            "label": "blood_vessel",
            "gt_file": "<base64>"
        }
        */

        // GET http://172.28.182.144:8010/1.3.12.2.1107.5.1.4.66711.30000018110100213625600166327/blood_vessel/predict/1.3.12.2.1107.5.1.4.66711.30000018110100213625600166328.png
        // GET http://172.28.182.144:8010/1.3.12.2.1107.5.1.4.66711.30000018110100213625600166327/blood_vessel/groundtruth/1.3.12.2.1107.5.1.4.66711.30000018110100213625600166328.png
        // http://172.28.182.144:8011/groundtruth/upload/
        

        // load next view
        const total_slices = this.medical_images.length;
        var new_active_idx = (current_active_idx+1<total_slices)?current_active_idx+1:current_active_idx;
        if (new_active_idx != current_active_idx) {
            this.setState({
                active_idx: new_active_idx
            });
        } else {
            // do nothing
        }

        this.medical_overlay_obj.setState({
            idx: new_active_idx+1+"",
        });
    }

    prev_slice_callback = () => {
        const current_active_idx = this.state.active_idx;
        var new_active_idx = (current_active_idx-1>=0)?current_active_idx-1:current_active_idx;
        if (new_active_idx != current_active_idx) {
            this.setState({
                active_idx: new_active_idx
            });
        } else {
            // do nothing
        }

        this.medical_overlay_obj.setState({
            idx: new_active_idx+1+"",
        });
    }

    go_to_slice_callback = (idx) => {
        const current_active_idx = this.state.active_idx;
        const total_slices = this.medical_images.length;
        var new_active_idx = idx;
        new_active_idx = (new_active_idx<0)?0:new_active_idx;
        new_active_idx = (new_active_idx>=total_slices)?total_slices-1:new_active_idx;

        if (new_active_idx != current_active_idx) {
            this.setState({
                active_idx: new_active_idx
            });
        } else {
            // do nothing
        }

        this.medical_overlay_obj.setState({
            idx: new_active_idx+1+"",
        });
    }

    sync_go_to_slice = (idx) => {
        this.props.medical_label_state.notify_go_to_slice(idx);
    }

    sync_copy_to_slice = (destination_phase_first_char) => {
        const chart_meta = this.chart_data.axis_ranges;

        if (!chart_meta) {
            return;
        }

        if (destination_phase_first_char == undefined) {
            this.props.medical_label_state.notify_copy_chart_to_slice(this.canvas_id, 
                this.state.lookup_table, 
                this.chart_data.control_points, 
                chart_meta.xmin, 
                chart_meta.xmax, 
                chart_meta.ymin, 
                chart_meta.ymax);
        } else {
            this.props.medical_label_state.notify_copy_chart_to_slice(null, 
                this.state.lookup_table, 
                this.chart_data.control_points, 
                chart_meta.xmin, 
                chart_meta.xmax, 
                chart_meta.ymin, 
                chart_meta.ymax,
                destination_phase_first_char);
        }        
    }

    update_chartjs_UI = (control_points, xmin, xmax, ymin, ymax) => {
        if (this.medical_overlay_obj != null) {
            var scatter_data = control_points;
            var g_data = MedicalChartBox.generate_line_data(scatter_data, xmin, xmax, ymin, ymax);
            var line_data = g_data.points;
            MedicalChartBox.update_chartjs_UI(this.medical_overlay_obj, scatter_data, line_data);
        }
    }

    // init activity
    load_dicom_and_visualize = () => {
        var dicom_url = this.medical_images[this.state.active_idx].url;
        if (dicom_url != "") {
            if (this.medical_images[this.state.active_idx].cornerstone_image == null) {
                console.log("Load " + dicom_url + " via network!");
                cornerstone.loadAndCacheImage(dicom_url).then(image => { // async calling
                    this.medical_images[this.state.active_idx].cornerstone_image = image;
                    var predict_list = this.medical_images[this.state.active_idx].predict;
                    if (predict_list && predict_list.length > 0) {
                        this.visualize();                        
                        wait_opencvjs_to_exec(function(data) {
                            var self = data.self;
                            var image = data.image;
                            var predict_list = data.predict_list;
                            
                            var async_processing_predict_mask = function(img, ctx, myCanvas, idx, end_idx, label_id, self) {
                                try {
                                    ctx.drawImage(img, 0, 0); // Or at whatever offset you like
                                    var p_cvmask = cv.imread(myCanvas);
                                    var g_cvmask = new cv.Mat();
                                    cv.cvtColor(p_cvmask, g_cvmask, cv.COLOR_RGBA2GRAY, 1);

                                    self.labeling_mask_layers[self.state.active_idx].push({
                                        x_percent: -1,
                                        y_percent: -1,
                                        label_id: label_id.toString(), // str
                                        mask: g_cvmask, // cv.Mat()
                                        delta: -1,
                                        editable: false,
                                    });

                                    self.recalculate_labeling_mask(label_id.toString());
                                    self.medical_overlay_obj.draw_mask();
                                } catch (e) {
                                    console.log("[Error] Exception while trying to load predict @ " + label_id);
                                }
                            }

                            for (var pl=0; pl<predict_list.length; pl++) {
                                const idx = pl;
                                var predict_info = predict_list[pl]; // {'label': 'liver', 'url': 'http://...'}
                                const label_id = self.props.medical_label_state.getLabelIdFromTagLabel(predict_info.label);

                                /*if(predict_info.label == "blood_vessel") {
                                    continue;
                                }*/

                                const myCanvas = document.createElement('canvas');
                                myCanvas.width  = image.width;
                                myCanvas.height = image.height;
                                const ctx = myCanvas.getContext('2d');
                                const img = new Image();
                                img.onload = function() {
                                    async_processing_predict_mask(img, ctx, myCanvas, idx, predict_list.length, label_id, self);
                                };
                                img.onerror = function() {
                                    // do nothing?
                                };
                                img.crossOrigin = "Anonymous";
                                img.src = predict_info.url;
                            }
                        }, {
                            self: this,
                            image: image,
                            predict_list: predict_list,
                        });
                    } else {
                        this.visualize();
                    }
                });
            } else {
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
            ctx.fillStyle = "#111111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // fill in CT image
            ctx.putImageData(imgData, canvas.width/2-imgData.width/2, canvas.height/2-imgData.height/2);

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

    merge_immutable_mask_layers = (label_id) => {
        const mask_layers = this.labeling_mask_layers[this.state.active_idx];
        // re-calculate the updated mask
        var new_cvmask = null;
        var idx_to_remove = [];
        for(var i=0; i<mask_layers.length; i++) {
            const mask = mask_layers[i];
            if (mask.label_id.toString() == label_id.toString()) {
                if (new_cvmask == null) {
                    new_cvmask = mask.mask;
                } else if (mask.editable == false) {
                    cv.add(new_cvmask, mask.mask, new_cvmask);  
                    idx_to_remove.push(i);
                }
            }
        }

        if (idx_to_remove.length > 0) {
            for(var i=idx_to_remove.length-1; i>=0; i--) {
                var idx = idx_to_remove[i];
                const mask = mask_layers[idx];
                mask.mask.delete();
                mask_layers.splice(idx, 1);
            }
        }
    }

    recalculate_labeling_mask = (label_id) => {
        const mask_layers = this.labeling_mask_layers[this.state.active_idx];
        // re-calculate the updated mask
        var new_cvmask = null;
        for(var i=0; i<mask_layers.length; i++) {
            const mask = mask_layers[i];
            if (mask.label_id.toString() == label_id.toString()) {
                if (new_cvmask == null) {
                    new_cvmask = mask.mask.clone();
                } else {
                    cv.add(new_cvmask, mask.mask, new_cvmask);  
                }
            }
        }

        label_id = label_id.toString();

        if (this.medical_images[this.state.active_idx].labeling_mask == null) {
            var js_obj = {};
            js_obj[label_id] = new_cvmask;
            this.medical_images[this.state.active_idx].labeling_mask = js_obj;
        } else {
            if (label_id in this.medical_images[this.state.active_idx].labeling_mask) {
                const old_mask = this.medical_images[this.state.active_idx].labeling_mask[label_id];
                if (old_mask != null) { old_mask.delete(); }
            }

            if (new_cvmask == null) {
                delete this.medical_images[this.state.active_idx].labeling_mask[label_id];
            } else {
                this.medical_images[this.state.active_idx].labeling_mask[label_id] = new_cvmask;
            }
        }
    }

    remove_labeling_mask_layers = (mask_idx) => { // this method will be called from overlay
        const mask_layers = this.labeling_mask_layers[this.state.active_idx];
        const mask_info = mask_layers[mask_idx];
        const label_id = mask_info.label_id;
        
        if (mask_info.mask != null) {
            mask_info.mask.delete(); // deallocate cv.Mat() object
        }
        this.labeling_mask_layers[this.state.active_idx].splice(mask_idx, 1);
        this.recalculate_labeling_mask(label_id);
        this.medical_overlay_obj.draw_mask();
    }

    set_total_items = (new_total_items) => {
        new_total_items = (typeof new_total_items != "undefined") ? new_total_items : this.original_total_items;
        this.setState({
            total_items: new_total_items,
        });        
    }

    set_medical_overlay = (overlay_obj) => {
        this.medical_overlay_obj = overlay_obj;
    }

    register_visualize_callback = (mycallback) => {
        this.visualize_callback = mycallback;
    }

    set_lookup_table = (new_lookup_table, control_points, xmin, xmax, ymin, ymax) => {
        var clone_lookup_table = Object.assign({}, new_lookup_table);
        // copy and save control points
        var cp_copy = [];
        for(var i=0; i<control_points.length; i++) {
            cp_copy.push({
                x: control_points[i].x,
                y: control_points[i].y
            });
        }
        this.chart_data.control_points = cp_copy;
        this.chart_data.axis_ranges = {
            xmin: xmin,
            xmax: xmax,
            ymin: ymin,
            ymax: ymax
        };
        this.setState({
            lookup_table: clone_lookup_table,
        });
    }

    set_zoom_area = (xmin, ymin, xmax, ymax) => {
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
    region_growing = (x_percent, y_percent, delta, mask_idx) => {
        mask_idx = (typeof mask_idx == "undefined")?-1:mask_idx;
        return wait_opencvjs_to_exec(function(data) {
            const x_percent = data.x_percent;
            const y_percent = data.y_percent;
            const mask_idx = data.mask_idx;
            var delta = data.delta;
            const self = data.self;

            delta = (typeof delta == "undefined")?15:delta;

            const cvimg = self.medical_images[self.state.active_idx].intensity_image;
            const x_abs = Math.floor(x_percent*cvimg.cols);
            const y_abs = Math.floor(y_percent*cvimg.rows);
    
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
            
            const label_id = (mask_idx>=0)?self.labeling_mask_layers[self.state.active_idx][mask_idx].label_id:self.props.medical_label_state.labelId.toString();

            if (mask_idx >= 0) {
                // update
                if (self.labeling_mask_layers[self.state.active_idx][mask_idx].mask != null) {
                    self.labeling_mask_layers[self.state.active_idx][mask_idx].mask.delete();
                }
                self.labeling_mask_layers[self.state.active_idx][mask_idx] = {
                    x_percent: x_percent,
                    y_percent: y_percent,
                    label_id: label_id, // str
                    mask: cvmask.clone(), // cv.Mat()
                    delta: delta,
                    editable: true,
                };
            } else {
                self.labeling_mask_layers[self.state.active_idx].push({
                    x_percent: x_percent,
                    y_percent: y_percent,
                    label_id: label_id, // str
                    mask: cvmask.clone(), // cv.Mat()
                    delta: delta,
                    editable: true,
                });
            }
            cvmask.delete();
            self.recalculate_labeling_mask(label_id);
        }, {
            x_percent: x_percent,
            y_percent: y_percent,
            delta: delta,
            mask_idx: mask_idx,
            self: this
        });
    }

    brush_point_at = (x_percent, y_percent, radius, shape, mask_idx, is_eraser, canvas_height_px) => {
        mask_idx = (typeof mask_idx == "undefined")?-1:mask_idx;
        is_eraser = (is_eraser == undefined)?false:is_eraser;
        return wait_opencvjs_to_exec(function(data) {
            const x_percent = data.x_percent;
            const y_percent = data.y_percent;
            const radius_percent = data.radius_percent;
            const shape = data.shape;
            const mask_idx = data.mask_idx;
            const gvc = data.gvc;
            const is_eraser = data.is_eraser;

            const cvimg = gvc.medical_images[gvc.state.active_idx].intensity_image;
            const x_abs = Math.floor(x_percent*cvimg.cols);
            const y_abs = Math.floor(y_percent*cvimg.rows);      
            const radius = Math.ceil(radius_percent * (gvc.state.zoom_ymax-gvc.state.zoom_ymin) * cvimg.rows);
            
            const label_id = (mask_idx>=0)?gvc.labeling_mask_layers[gvc.state.active_idx][mask_idx].label_id:gvc.props.medical_label_state.labelId.toString();

            var draw_area = function(cvmask, x_center, y_center, radius, area_shape, value) {
                value = (value == undefined)?255:value;
                var to_loc1d = (x, y) => (y*cvmask.cols*cvmask.channels()+x*cvmask.channels());
                var is_valid_xy = (x, y) => x>=0 && y>=0 && x<cvmask.cols && y<cvmask.rows;
                // directly modify cvmask
                var counter = 0;
                for(var x=x_center-radius; x<=x_center+radius; x++) {
                    for (var y=y_center-radius; y<=y_center+radius; y++) {
                        if (!is_valid_xy(x, y)) {
                            continue;
                        }
                        counter += 1;
                        const loc_1d = to_loc1d(x, y);   
                        if (area_shape=="circle") {
                            const dist = Math.sqrt(Math.pow(x-x_center, 2)+Math.pow(y-y_center, 2));
                            if (dist <= radius) {
                                cvmask.data[loc_1d] = value;
                            }
                        } else if (area_shape=="rectangle") {
                            cvmask.data[loc_1d] = value;
                        }
                    }
                }
            }

            if (!is_eraser) {
                if (mask_idx >= 0) {
                    // update
                    var cvmask = gvc.labeling_mask_layers[gvc.state.active_idx][mask_idx].mask;                
                    draw_area(cvmask, x_abs, y_abs, radius, shape);
                    //gvc.labeling_mask_layers[gvc.state.active_idx][mask_idx].mask = cvmask;
                } else {
                    var cvmask = new cv.Mat(cvimg.rows, cvimg.cols, cv.CV_8U, new cv.Scalar(0));    
                    draw_area(cvmask, x_abs, y_abs, radius, shape);
                    gvc.labeling_mask_layers[gvc.state.active_idx].push({
                        x_percent: x_percent,
                        y_percent: y_percent,
                        label_id: label_id.toString(), // str
                        mask: cvmask, // cv.Mat()
                        delta: -1,
                        editable: true,
                    });                
                }
            } else {
                for (var midx=0; midx<gvc.labeling_mask_layers[gvc.state.active_idx].length; midx++) {
                    var cvmask = gvc.labeling_mask_layers[gvc.state.active_idx][midx].mask;
                    draw_area(cvmask, x_abs, y_abs, radius, shape, 0);
                }
            }
            
            gvc.recalculate_labeling_mask(label_id);
        }, {
            x_percent: x_percent,
            y_percent: y_percent,
            radius_percent: radius/canvas_height_px,
            shape: shape,
            mask_idx: mask_idx,
            gvc: this,
            is_eraser: is_eraser
        });
    }

    boundary_mode_callback = () => {
        if (this.medical_overlay_obj) {
            this.medical_overlay_obj.draw_mask();
        }        
    }

    componentDidMount = () => {
        this.visualize_callback = this.medical_overlay_obj.draw_mask;
        this.load_dicom_and_visualize();
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        this.visualize_callback = this.medical_overlay_obj.draw_mask;
        this.load_dicom_and_visualize();
    }

    render() {        
        const xs_value = (this.state.total_items == 1) ? 12 : 6;
        var medicalGridContainer = document.getElementById("labeling");
        const canvas_width = ((this.state.total_items == 1)?medicalGridContainer.clientWidth:medicalGridContainer.clientWidth/2)*0.98;
        const canvas_height = ((this.state.total_items == 1)?medicalGridContainer.clientHeight:medicalGridContainer.clientHeight/2)*0.98;
        
        ///console.log("medical-gvcornerstone > render()");
        
        return (
            <Grid item xs={xs_value} style={{padding: "1px"}} className="griditem_container" id={"griditem_container-"+this.canvas_id}>
                <div style={{height: canvas_height+'px', width: canvas_width+'px'}}>
                    <div style={{position: "relative"}}>
                        <GVMedicalOverlay 
                            width={canvas_width} 
                            height={canvas_height}
                            canvas_id={"overlay-"+this.canvas_id}
                            original_canvas_id={this.canvas_id}
                            gvc={this}
                            total_items={this.state.total_items}
                            medical_label_state={this.props.medical_label_state}
                            phase_name={this.props.phase_name}/>
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
