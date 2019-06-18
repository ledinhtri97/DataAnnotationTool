import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ZoomIn from '@material-ui/icons/ZoomIn';
import ZoomOut from '@material-ui/icons/ZoomOut';
import Fullscreen from '@material-ui/icons/Fullscreen';
import FullscreenExit from '@material-ui/icons/FullscreenExit';
import AllOut from '@material-ui/icons/AllOut';
import Layers from '@material-ui/icons/Layers';
import LayersClear from '@material-ui/icons/LayersClear';
import ShowChart from '@material-ui/icons/ShowChart';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Brush from '@material-ui/icons/Brush';

import MedicalImageProcessingBox from './medical-image-processing-box';
import MedicalChartBox from './medical-chart-box';

const styles = theme => ({
    createjs_canvas: {
        position: "absolute", 
        top: "0px", 
        left: "0px",         
        zIndex: "10"
    },
    icon: {
        backgroundColor: "#00000000",
        color: "#ffffffdd"
    },
    icon_button: {
        paddingBottom: "0px",
        paddingTop: "0px"
    },
    pos_text_info: {
        color: "white",
    },
    lightTooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
    button_preset_chart: {
        color: 'black',
        background: '#FFFF0088',
        padding: '0px',
        margin: '5px',
    },
    button_copy_to_specific_slice: {
        color: 'black',
        background: '#FFFFFF88',
        maxWidth: '32px',
        padding: '0px',
        margin: '5px',
    }
});

class GVMedicalOverlay extends React.Component {

    supported_phases = ["Non Contrast", "Arterial", "Venous", "Delay"];

    state = {
        idx: "1",
    }

    data = {
        is_zoom_in: false,
        is_ready_to_zoom_in: false,
        zoom_from_x: -1,
        zoom_from_y: -1,
        is_chosen_zoom_from: false,
        zoom_to_x: -1,
        zoom_to_y: -1
    };

    zoom_in_button_id = "zoom_in_button_";
    zoom_reset_button_id = "zoom_reset_button_";
    full_screen_button_id = "full_screen_button_id_";
    restore_screen_button_id = "restore_screen_button_id_";
    show_mask_editor_button_id = "show_mask_editor_button_id_";
    close_mask_editor_button_id = "close_mask_editor_button_id_";
    mask_layers_editor_id = "mask_layers_editor_id_";
    show_chart_button_id = "show_chart_button_id_";
    copy_chart_to_other_slices_button_id = "copy_chart_to_other_slices_button_id_";
    chart_editor_id = "chart_editor_id_";
    chart_canvas_id = "chart_canvas_id_";
    brush_button_id = "brush_button_id_";
    chart_js_obj = null;

    chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };
    is_rendered_chart = false;
    width_chart = 0;
    height_chart = 0;

    canvas_createjs_id = "canvas_createjs_id_";
    input_text_slice_id = "input_text_slice_id_";

    last_action = "";
    last_labeling_mask = null;

    chart_js_obj = null;
    chart_js_config = {
        
        data: {
            datasets: [
            {
                type: 'scatter',
                backgroundColor: Chart.helpers.color(this.chartColors.yellow).alpha(0.5).rgbString(),
                borderColor: this.chartColors.yellow,
                pointRadius: 4,
                showLine: false,
                data: [{
                    x: 0,
                    y: 0
                }, {
                    x: 2000,
                    y: 255
                }],
            } ,{
                type: 'line',
                backgroundColor: Chart.helpers.color(this.chartColors.yellow).alpha(0.5).rgbString(),
                borderColor: this.chartColors.yellow,
                fill: true,
                pointRadius: 0,
                data: [{
                    x: 0,
                    y: 0
                }, {
                    x: 2000,
                    y: 255
                }],
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 0
            },
            title: {
                display: false,
                text: 'Chart.js'
            },
            legend: {
                display: false
            },
            tooltips: {
                intersect: true,
                mode: 'single',
                callbacks: {
                    label: (tooltipItem, data) => {
                        // data for manipulation
                        return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x.toFixed(2);
                    },
                    title: (tooltipItems, data) => {
                        return "Hounsfield";
                    }
                },
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Hounsfield',
                        fontColor: "yellow",
                    },
                    ticks: {
                        fontColor: "yellow",
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Intensity',
                        fontColor: "yellow",
                    },
                    ticks: {
                        fontColor: "yellow",
                        min: 0,
                        max: 255,
                        stepSize: 70
                    }
                }]
            },
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            }
        }
    };

    constructor(props) {
        super(props);
        this.zoom_in_button_id = this.zoom_in_button_id + props.canvas_id;
        this.zoom_reset_button_id = this.zoom_reset_button_id + props.canvas_id;
        this.full_screen_button_id = this.full_screen_button_id + props.canvas_id;
        this.restore_screen_button_id = this.restore_screen_button_id + props.canvas_id;
        this.canvas_createjs_id = this.canvas_createjs_id + props.canvas_id;
        this.show_mask_editor_button_id += props.canvas_id;
        this.close_mask_editor_button_id += props.canvas_id;
        this.mask_layers_editor_id += props.canvas_id;
        this.show_chart_button_id += props.canvas_id;
        this.chart_editor_id += props.canvas_id;
        this.chart_canvas_id += props.canvas_id;
        this.input_text_slice_id += props.canvas_id;
        this.copy_chart_to_other_slices_button_id += props.canvas_id;
        this.brush_button_id += props.canvas_id;
        props.tunnel_set_medical_overlay(this);
        console.log("Overlay rerender!");

        /*const active_idx = props.tunnel_retrieve_state().active_idx;
        this.setState({
            idx: active_idx+1+""
        });*/
    }

    focus_on_mouse = (canvasId, offsetX, offsetY, imgWidth, imgHeight, color) => {
        //console.log("Drawing " + canvasId + " " + offsetX + " " + offsetY + " " + imgWidth + " " + imgHeight);
        var stage = new createjs.Stage(canvasId);
        var shape = new createjs.Shape();
        color = (typeof color == "undefined") ? "#ffff00" : color;
        shape.graphics.beginStroke(color).setStrokeDash([7, 5], 0).setStrokeStyle(2); //change color of big plus to red -> tri | 241018
        var x_start = offsetX;
        var y_start = 0;

        shape.graphics.moveTo(offsetX, 0);
        shape.graphics.lineTo(offsetX, imgHeight);

        shape.graphics.moveTo(0, offsetY);
        shape.graphics.lineTo(imgWidth, offsetY);    

        stage.addChild(shape);
        stage.update();
        return;
    }
    
    draw_rect = (canvasId, x, y, w, h, color) => {
        var stage = new createjs.Stage(canvasId);    
        var rect = new createjs.Shape();
        color = (typeof color == "undefined") ? "#ffff00" : color;
        //rect.graphics.beginStroke("#ffffff").setStrokeStyle(3).drawRect(x, y, w, h);
        // https://www.createjs.com/docs/easeljs/classes/Graphics.html#method_setStrokeStyle
        rect.graphics.beginStroke(color).setStrokeDash([7, 5], 0)
            .setStrokeStyle(2).drawRect(x, y, w, h);
        stage.addChild(rect);
        stage.update();
    }

    label_selected = () => {
        console.log('Overlay > label_selected()');
        const self = this;
        const label_id = this.props.medical_label_state.getLabelId();
        if (label_id > 0) {
            document.getElementById(this.brush_button_id).style.display = "block";
        } else {
            document.getElementById(this.brush_button_id).style.display = "none";
        }
    }

    start_labeling_by_brush = () => {
        console.log('Overlay > start_labeling_by_brush()');
    }

    draw_mask = () => {
        var overlay_canvas = document.getElementById(this.props.canvas_id);
        var context = overlay_canvas.getContext("2d");
        context.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);

        const div_editor = document.getElementById(this.mask_layers_editor_id);
        while (div_editor.firstChild) {
            div_editor.removeChild(div_editor.firstChild);
        }

        //var createjs_canvas = document.getElementById(this.canvas_createjs_id);
        //createjs_canvas.getContext("2d").clearRect(0, 0, createjs_canvas.width, createjs_canvas.height);

        const medical_images = this.props.tunnel_retrieve_medical_images();
        const state = this.props.tunnel_retrieve_state();
        const vis_meta = this.props.tunnel_retrieve_vis_meta();
        const label_id = this.props.medical_label_state.getLabelId();
        const self = this;

        //console.log("[" + this.props.canvas_id + "] Draw mask for " + this.props.medical_label_state.getTagLabel() + " (" + label_id + ")" + " | state.active_idx: " + state.active_idx);

        //if (medical_images[state.active_idx].labeling_mask == null || !(label_id in medical_images[state.active_idx].labeling_mask)) {
        if (medical_images[state.active_idx].labeling_mask == null) {
            console.log("[" + this.props.canvas_id + "] " + "Labeling Mask is null! Label ID: " + label_id + ". medical_images[state.active_idx].labeling_mask:");
            console.log(medical_images[state.active_idx].labeling_mask);
            return;
        }

        const labeling_mask_layers = this.props.tunnel_retrieve_labeling_mask_layers();
        const mask_layers = labeling_mask_layers[state.active_idx];        
        
        var dom_mask_items = [];
        for (var ml=0; ml<mask_layers.length; ml++) {
            const mask_info = mask_layers[ml];
            const mask_label_id = parseInt(mask_info.label_id);
            if (mask_label_id != label_id && label_id >= 0) {
                continue;
            }

            var label_info = null;
            for (var al=0; al<this.props.medical_label_state.all_labels.length; al++) {
                if (this.props.medical_label_state.all_labels[al].id == mask_label_id) {
                    label_info = this.props.medical_label_state.all_labels[al];
                    break;
                }                
            }

            if (label_info != null) {
                const mask_label_tag_name = label_info.tag_label;

                var div_node = document.createElement("div");
                div_node.style.textAlign = "right";
                var text_node = document.createTextNode(mask_label_tag_name);
                div_node.appendChild(text_node);
                
                const mask_idx = ml;

                var track_bar_node = document.createElement("span");
                var delta_string = (mask_info.delta.toString().length==2)?mask_info.delta.toString():"&nbsp;&nbsp;"+mask_info.delta.toString();
                track_bar_node.innerHTML = '&nbsp;&nbsp;<input type="range" id="trackbar" value="' + mask_info.delta + '" min="1" max="35" step="1" width="30%"> <span name="intensity_threshold">' + delta_string + '</span>';
                track_bar_node.getElementsByTagName("input")[0].addEventListener('input', function() {
                    const value = this.value;
                    var value_str = (value.toString().length==2)?value.toString():"&nbsp;&nbsp;"+value.toString();
                    this.parentNode.getElementsByTagName("span")[0].innerHTML = value_str;
                });
                track_bar_node.getElementsByTagName("input")[0].addEventListener('change', function() {
                    self.props.tunnel_region_growing(mask_info.x_percent, mask_info.y_percent, parseInt(this.value), mask_idx);
                    self.draw_mask();
                });
                div_node.appendChild(track_bar_node);

                
                var remove_icon_node = document.createElement("span");
                remove_icon_node.style.cursor = "pointer";
                remove_icon_node.innerHTML = '&nbsp;&nbsp;<i class="fa fa-times-circle-o fa-2" aria-hidden="true"></i>';
                remove_icon_node.addEventListener('click', function() {
                    self.props.tunnel_remove_labeling_mask_layers(mask_idx);
                });
                div_node.appendChild(remove_icon_node);

                dom_mask_items.push(div_node);
            }
        }

        for(var dmi=0; dmi<dom_mask_items.length; dmi++) {
            div_editor.appendChild(dom_mask_items[dmi]);
        }


        this.props.medical_label_state.all_labels.map(function(lb, key) {
            if (lb.id != label_id && label_id>=0) {
                return;
            }

            const lb_id = lb.id;

            if (medical_images[state.active_idx].labeling_mask==null || !(lb_id in medical_images[state.active_idx].labeling_mask)) {
                return;
            }

            var cvmask = medical_images[state.active_idx].labeling_mask[lb_id].clone();
            cvmask = MedicalImageProcessingBox.ROI(cvmask, 
                state.zoom_xmin, 
                state.zoom_ymin,
                state.zoom_xmax,
                state.zoom_ymax);
    
            cvmask = MedicalImageProcessingBox.fit(cvmask, overlay_canvas.width, overlay_canvas.height);

            const shift_x_px = (vis_meta.viewing_canvas_width_px - vis_meta.viewing_image_width_px)/2;
            const shift_y_px = (vis_meta.viewing_canvas_height_px - vis_meta.viewing_image_height_px)/2;
            var image_data = context.getImageData(shift_x_px, shift_y_px, vis_meta.viewing_image_width_px, vis_meta.viewing_image_height_px);
            var pix = image_data.data;
            var to_loc1d = (x, y) => (y*image_data.width+x)*4;
    
            const segment_color_hex = lb.color.substr(1,6);
            var segment_r = parseInt(segment_color_hex.substr(0, 2), 16);
            var segment_g = parseInt(segment_color_hex.substr(2, 2), 16);
            var segment_b = parseInt(segment_color_hex.substr(4), 16);
    
            // modify image data
            for(var p=0; p<cvmask.rows*cvmask.cols; p++) {
                if (cvmask.data[p] > 0) {
                    var loc1d = p * 4;
                    if (pix[loc1d+3]==0) {
                        pix[loc1d] = segment_r;
                        pix[loc1d+1] = segment_g;
                        pix[loc1d+2] = segment_b;
                        pix[loc1d+3] = 127;     // alpha: opaque=255, transparent=0
                    } else {
                        pix[loc1d] = (pix[loc1d]+segment_r)/2;
                        pix[loc1d+1] = (pix[loc1d+1]+segment_g)/2;
                        pix[loc1d+2] = (pix[loc1d+2]+segment_b)/2;
                        pix[loc1d+3] = 127;     // alpha: opaque=255, transparent=0
                    }                    
                }
            }
            cvmask.delete();
            context.putImageData(image_data, shift_x_px, shift_y_px);
        });
    }

    mouse_move = (event) => {
        MedicalChartBox.mouse_move(event, this);
    }
    
    mouse_down = (event) => {
        MedicalChartBox.mouse_down(event, this);
    }
    
    mouse_up = (event) => {
        MedicalChartBox.mouse_up(event, this);
    }

    chart_canvas_mouse_down = (event) => {
        MedicalChartBox.chart_canvas_mouse_down(event, this);
    }

    chart_canvas_mouse_move = (event) => {
        MedicalChartBox.chart_canvas_mouse_move(event, this);
    }

    chart_canvas_mouse_up = (event) => {
        MedicalChartBox.chart_canvas_mouse_up(event, this);
    }

    go_to_slice = (event) => {
        if (event.key === 'Enter') {
            if (!isNaN(this.state.idx) && this.state.idx.length > 0) { // input text is number
                this.props.tunnel_go_to_slice_idx(parseInt(this.state.idx)-1);
            }     
        }     
    }

    activate_zoom_in = () => {
        document.getElementById(this.canvas_createjs_id).style.cursor = "crosshair";
        this.data.is_ready_to_zoom_in = true;
        document.getElementById(this.zoom_in_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd";        
        return;
    }
    
    reset_zoom = () => {
        this.reset_data();
        this.props.tunnel_set_zoom_area(0, 0, 1, 1);
        document.getElementById(this.zoom_in_button_id).getElementsByTagName("svg")[0].style.color = "#ffffffdd";
        this.props.tunnel_register_visualize_callback(this.draw_mask);
        return;
    }

    full_screen = () => {
        if (this.data.is_zoom_in) {
            this.reset_zoom();
        }

        var dom_griditem_container = document.getElementsByClassName("griditem_container"); // check medical-gvcornerstone.js > render()
        for(var i=0; i<dom_griditem_container.length; i++) {
            if(dom_griditem_container[i].id.indexOf(this.props.original_canvas_id) === -1) {
                dom_griditem_container[i].style.display = "none";
            }
        }
        this.props.tunnel_set_total_items(1);

        document.getElementById(this.full_screen_button_id).style.display = "none";
        document.getElementById(this.restore_screen_button_id).style.display = "block";

        this.last_action = "full_screen";

        this.props.tunnel_register_visualize_callback(this.draw_mask);

        return;
    }

    restore_screen = () => { // reverse full_screen action
        if (this.data.is_zoom_in) {
            this.reset_zoom();
        }

        var dom_griditem_container = document.getElementsByClassName("griditem_container"); // check medical-gvcornerstone.js > render()
        for(var i=0; i<dom_griditem_container.length; i++) {
            if(dom_griditem_container[i].id.indexOf(this.props.original_canvas_id) === -1) {
                dom_griditem_container[i].style.display = "block";
            }
        }
        this.props.tunnel_set_total_items(); // call with no param to restore "total_items" value
        document.getElementById(this.full_screen_button_id).style.display = "block";
        document.getElementById(this.restore_screen_button_id).style.display = "none";

        this.props.tunnel_register_visualize_callback(this.draw_mask);
        ///this.is_rendered_chart = false;

        return;
    }

    show_mask_editor = () => {
        document.getElementById(this.show_mask_editor_button_id).style.display = "none";
        document.getElementById(this.close_mask_editor_button_id).style.display = "block";
        document.getElementById(this.close_mask_editor_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd";  
        document.getElementById(this.mask_layers_editor_id).style.display = "block";
    }

    close_mask_editor = () => {
        document.getElementById(this.show_mask_editor_button_id).style.display = "block";
        document.getElementById(this.close_mask_editor_button_id).style.display = "none";
        document.getElementById(this.mask_layers_editor_id).style.display = "none";
    }

    show_or_close_chart = () => {        
        if (document.getElementById(this.show_chart_button_id).getElementsByTagName("svg")[0].style.color != "rgba(255, 255, 0, 0.867)") {
            // show chart
            document.getElementById(this.show_chart_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd";
            document.getElementById(this.chart_editor_id).style.display = "block";

            this.init_chart_if_not_rendered();
        } else {
            // close chart
            document.getElementById(this.show_chart_button_id).getElementsByTagName("svg")[0].style.color = "#ffffffdd";
            document.getElementById(this.chart_editor_id).style.display = "none";
        }        
    }

    init_chart_if_not_rendered = () => {
        if (!this.is_rendered_chart) {
            var ctx = document.getElementById(this.chart_canvas_id).getContext('2d');
            const medical_images = this.props.tunnel_retrieve_medical_images();
            const state = this.props.tunnel_retrieve_state();
            const cornerstone_image = medical_images[state.active_idx].cornerstone_image;
            const min_hounsfield = cornerstone_image.minPixelValue*cornerstone_image.slope + cornerstone_image.intercept;
            const max_hounsfield = cornerstone_image.maxPixelValue*cornerstone_image.slope + cornerstone_image.intercept;

            this.chart_js_config.data.datasets[1].data[0].x = min_hounsfield;
            this.chart_js_config.data.datasets[1].data[1].x = max_hounsfield;
            this.chart_js_config.data.datasets[0].data[0].x = min_hounsfield;
            this.chart_js_config.data.datasets[0].data[1].x = max_hounsfield;

            this.chart_js_config.options.scales.xAxes[0].ticks.min = min_hounsfield;
            this.chart_js_config.options.scales.xAxes[0].ticks.max = max_hounsfield;
            this.chart_js_config.options.scales.xAxes[0].ticks.stepSize = Math.floor(max_hounsfield/5);

            this.chart_js_obj = new Chart(ctx, this.chart_js_config);
            this.is_rendered_chart = true;
            this.chart_data.x_range = Math.abs(max_hounsfield - min_hounsfield);
            this.chart_data.min_hounsfield = min_hounsfield;
            this.chart_data.max_hounsfield = max_hounsfield;
        } else {
            // do nothing!
        }
    }

    copy_chart_to_other_slices = () => {
        this.props.tunnel_sync_copy_to_slice();
    }

    copy_chart_to_one_slice = (phase_name) => {
        this.props.tunnel_sync_copy_to_slice(phase_name[0]);
    }

    set_chart_for_liver = () => {
        MedicalChartBox.set_chart_for_liver(this);
    }

    set_chart_for_lung = () => {
        MedicalChartBox.set_chart_for_lung(this);
    }

    set_chart_for_blood_vessel = () => {
        MedicalChartBox.set_chart_for_blood_vessel(this);
    }

    reset_data = () => {
        this.data = {
            is_zoom_in: false,
            is_ready_to_zoom_in: false,
            zoom_from_x: -1,
            zoom_from_y: -1,
            is_chosen_zoom_from: false,
            zoom_to_x: -1,
            zoom_to_y: -1
        };
        document.getElementById(this.canvas_createjs_id).style.cursor = "default";
    }    

    /*on_key_pressed = (e) => {
        console.log("e.nativeEvent.keyCode");
        console.log(e.nativeEvent.keyCode);
        if (e.nativeEvent.keyCode == 192) { // ~ key
            console.log("Pressed ~");
        }
    }*/

    handleClick = (e) => {
        if (e.nativeEvent.which === 1) {
            console.log("Left Click");
        } else if (e.nativeEvent.which === 3) {
            /*
            // activate zoom-in or reset zoom
            if ((!this.data.is_zoom_in) && (!this.data.is_ready_to_zoom_in)) {
                this.activate_zoom_in();
                e.preventDefault();
            } else 
            */
            // reset zoom if being zoom in
            if (this.data.is_zoom_in) {
                this.reset_zoom();
                e.preventDefault();
            } else if (this.last_action == "full_screen") {
                this.restore_screen();
                e.preventDefault();
            }
        }
    }

    componentDidMount() {
        this.show_mask_editor();
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (this.chart_js_obj) {
            document.getElementById(this.chart_canvas_id).style.width = this.width_chart+"px";
            document.getElementById(this.chart_canvas_id).style.height = this.height_chart+"px";
        }

        /*const active_idx = this.props.tunnel_retrieve_state().active_idx;
        if (active_idx+1+"" != this.state.idx) {
            this.setState({
                idx: active_idx+1+""
            });
        }*/
    }

    chart_data = {
        down_x: -1,
        down_y: -1,
        down_point_close_idx: -1,
        is_keeping_mouse_down: false,
        up_x: -1,
        up_y: -1,
        x_range: -1,
        y_range: 256,
        min_hounsfield: -1,
        max_hounsfield: -1,
    }

    render() {
        const { classes, width, height, canvas_id } = this.props;
        const total_images = this.props.tunnel_retrieve_medical_images().length;
        const active_idx = this.props.tunnel_retrieve_state().active_idx;
        const self = this;
        /*if (active_idx+1+"" != this.state.idx) {
            this.setState({
                idx: active_idx+1+""
            });
        }*/
        //////this.idx = active_idx+1+"";

        this.width_chart = Math.floor(width * 0.5);
        this.height_chart = Math.floor(height * 0.5);

        if (this.width_chart > this.height_chart) {
            this.width_chart = Math.floor(this.height_chart * 1.5);
        } else {
            this.height_chart = Math.floor(this.width_chart * 1.5);
        }

        console.log("medical-overlay > render()");

        return (
            <div>
                <canvas className={classes.createjs_canvas} 
                    id={canvas_id}
                    width={width+"px"} 
                    height={height+"px"}></canvas>
                <canvas className={classes.createjs_canvas} 
                    id={this.canvas_createjs_id}
                    width={width+"px"} 
                    height={height+"px"} 
                    onMouseMove={this.mouse_move}
                    onMouseUp={this.mouse_up}
                    onMouseDown={this.mouse_down}
                    onContextMenu={this.handleClick}></canvas>
                <div style={{position: "absolute", left: "0px", top: "0px", zIndex: "100", margin: "0.5em"}}>
                    <div style={{marginBottom: "0.5em", textAlign: "left"}}><span className={classes.pos_text_info}>{this.props.phase_name}</span></div>

                    <div style={{marginBottom: "0.5em", textAlign: "center"}}>
                        <span className={classes.pos_text_info}>
                        <input type="text" id={this.input_text_slice_id} 
                            value={this.state.idx} 
                            onChange={event => {this.setState({idx: event.target.value})}} 
                            onKeyPress={this.go_to_slice}
                            style={{
                                width: "36px",
                            }}/></span><span className={classes.pos_text_info}> / {total_images}</span>
                    </div>
                    <IconButton onClick={this.activate_zoom_in} id={this.zoom_in_button_id} className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Zoom In" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <ZoomIn className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                    <IconButton onClick={this.reset_zoom} id={this.zoom_reset_button_id} className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Zoom Out" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <ZoomOut className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                    
                    <IconButton onClick={this.full_screen} id={this.full_screen_button_id} className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Fullscreen" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Fullscreen className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                    <IconButton onClick={this.restore_screen} id={this.restore_screen_button_id} className={classes.icon_button}
                        style={{display: "none"}}>
                        <Tooltip title="Exit Fullscreen" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <FullscreenExit className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                    
                    <IconButton onClick={this.show_mask_editor} id={this.show_mask_editor_button_id} className={classes.icon_button}
                        style={{display: "none"}}>
                        <Tooltip title="Edit Labels" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Layers className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                    <IconButton onClick={this.close_mask_editor} id={this.close_mask_editor_button_id} className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Edit Labels" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Layers className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                    <IconButton onClick={this.show_or_close_chart} id={this.show_chart_button_id} className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Show Chart" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <ShowChart className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                    
                    <IconButton onClick={this.start_labeling_by_brush} id={this.brush_button_id} className={classes.icon_button}
                        style={{display: "none"}}>
                        <Tooltip title="Labeling by brush" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Brush className={classes.icon} fontSize="large"/>
                        </Tooltip></IconButton>
                </div>

                <div id={this.mask_layers_editor_id} 
                    style={{position: "absolute", 
                        right: "0px", 
                        top: "0px", 
                        zIndex: "100", 
                        margin: "0.5em",
                        maxHeight: "100%",
                        overflow: "auto"}}
                    className={classes.pos_text_info}>
                </div>

                <div id={this.chart_editor_id} 
                    style={{position: "absolute", 
                    left: "8%", 
                    top: "0px", 
                    zIndex: "100", 
                    margin: "0.5em",
                    maxHeight: "100%",
                    overflow: "auto",
                    display: "none"}}
                    className={classes.pos_text_info}>
                    <canvas id={this.chart_canvas_id}
                        width={this.width_chart+"px"} 
                        height={this.height_chart+"px"}
                        onMouseMove={this.chart_canvas_mouse_move}
                        onMouseUp={this.chart_canvas_mouse_up}
                        onMouseDown={this.chart_canvas_mouse_down}/>
                    <div>                        
                        <span>
                            <Button variant="contained" color="secondary" 
                                className={classes.button_preset_chart} 
                                onClick={this.set_chart_for_liver}>Liver</Button>
                        </span>
                        <span>
                            <Button variant="contained" color="secondary" 
                                className={classes.button_preset_chart} 
                                onClick={this.set_chart_for_lung}>Lung</Button>
                        </span>
                        <span>
                            <Button variant="contained" color="secondary" 
                                className={classes.button_preset_chart} 
                                onClick={this.set_chart_for_blood_vessel}>Blood Vessel</Button>
                        </span>
                    </div>

                    <div>
                        <span>
                            <IconButton onClick={this.copy_chart_to_other_slices} 
                                id={this.copy_chart_to_other_slices_button_id} 
                                className={classes.icon_button}
                                style={{display: "inherit"}}>
                                <Tooltip title="Apply to all slices in this view" placement="bottom" classes={{tooltip: classes.lightTooltip}}>
                                    <AllOut className={classes.icon} fontSize="large"/>
                                </Tooltip>
                            </IconButton>
                        </span>

                        {
                            this.supported_phases.map( function(phname, i) {
                                if (phname[0] == self.props.phase_name[0]) {
                                    return;
                                }
                                return (
                                    <Button variant="contained" color="secondary" key={i} 
                                        className={classes.button_copy_to_specific_slice} 
                                        onClick={() => self.copy_chart_to_one_slice(phname)}>{phname[0]}</Button>
                                )
                            })
                        }                        
                    </div>
                </div>
            </div>
        )
    }
}

GVMedicalOverlay.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GVMedicalOverlay);
