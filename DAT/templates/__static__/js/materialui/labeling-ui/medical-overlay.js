import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ZoomIn from '@material-ui/icons/ZoomIn';
import ZoomOut from '@material-ui/icons/ZoomOut';
import Fullscreen from '@material-ui/icons/Fullscreen';
import FullscreenExit from '@material-ui/icons/FullscreenExit';
import Layers from '@material-ui/icons/Layers';
import LayersClear from '@material-ui/icons/LayersClear';

import MedicalImageProcessingBox from './medical-image-processing-box';

/*
function generateCanvas(id_canvas) {
    if (id_canvas !== undefined) {
        // argument passed and not undefined: do nothing
    } else {
        id_canvas = "imgCanvas";
    }

    number_of_canvas++;
    var canvas = document.createElement('canvas');
    
    canvas.id = String(genId(5));
    var bgCanvas = document.getElementById(id_canvas);
    canvas.width = bgCanvas.width;
    canvas.height = bgCanvas.height;
    //canvas.style.zIndex = number_of_canvas;
    canvas.style.zIndex = 10;
    canvas.style.position = "absolute";
    
    // 180524
    canvas.style.left = bgCanvas.style.left;
    canvas.style.top = bgCanvas.style.top;
    //canvas.style.left = 0;
    //canvas.style.top = 0;

    var container = $('#' + id_canvas).parent().get(0);
    container.appendChild(canvas);

    // set cursor crosshair
    $(canvas).css('cursor', 'crosshair');

    return canvas.id;    
}

function genId(str_len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
    for (var i = 0; i < str_len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}
*/

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
    }
});

class GVMedicalOverlay extends React.Component {

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

    canvas_createjs_id = "canvas_createjs_id_";

    last_action = "";
    last_labeling_mask = null;

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
        props.tunnel_set_medical_overlay(this);
        console.log("Overlay rerender!");
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
                track_bar_node.innerHTML = '&nbsp;&nbsp;<input type="range" id="trackbar" value="' + mask_info.delta + '" min="1" max="25" step="1" width="30%"> <span name="intensity_threshold">' + delta_string + '</span>';
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
        const offsetX = event.nativeEvent.offsetX;
        const offsetY = event.nativeEvent.offsetY;
        const imgWidth = this.props.width;
        const imgHeight = this.props.height;

        const overlay_canvas_id = this.canvas_createjs_id;

        if (this.data.is_ready_to_zoom_in) {
            this.focus_on_mouse(overlay_canvas_id, offsetX, offsetY, imgWidth, imgHeight);
        }

        if (this.data.is_chosen_zoom_from) {
            // draw rectangle from zoom_from to current mouse pointer
            this.draw_rect(overlay_canvas_id, 
                this.data.zoom_from_x, 
                this.data.zoom_from_y, 
                offsetX-this.data.zoom_from_x, 
                offsetY-this.data.zoom_from_y);
        }
    }
    
    mouse_down = (event) => {  
        if (event.nativeEvent.which === 3) { // no processing on right click
            return;
        }

        if (this.data.is_ready_to_zoom_in) {
            this.data.zoom_from_x = event.nativeEvent.offsetX;
            this.data.zoom_from_y = event.nativeEvent.offsetY;
            this.data.is_chosen_zoom_from = true;
        //} else if (!this.data.is_zoom_in) {
        } else {
            // apply region growing algorithm
            const x = event.nativeEvent.offsetX;
            const y = event.nativeEvent.offsetY;
            const vis_meta = this.props.tunnel_retrieve_vis_meta();
            const image_layer_state = this.props.tunnel_retrieve_state();
            const point2d = this.convert_canvas_coord_to_image_coord_percent(x, y, vis_meta, image_layer_state);
            
            if (point2d.x < 0 || point2d.y < 0 || point2d.x > 1 || point2d.y > 1) {
                return;
            }

            this.props.tunnel_region_growing(point2d.x, point2d.y);
            this.draw_mask();
        }
    }
    
    mouse_up = (event) => {
        if (event.nativeEvent.which === 3) {
            // no processing on left or right click, we did it on mouse_down
            return;
        } 
        
        if (this.data.is_ready_to_zoom_in) {
            // do zoom in action            
            const x_from = this.data.zoom_from_x;
            const y_from = this.data.zoom_from_y;
            const x_to = event.nativeEvent.offsetX;
            const y_to = event.nativeEvent.offsetY;

            const vis_meta = this.props.tunnel_retrieve_vis_meta();
            const image_layer_state = this.props.tunnel_retrieve_state();

            const point_from = this.convert_canvas_coord_to_image_coord_percent(x_from, y_from, vis_meta, image_layer_state);
            const point_to = this.convert_canvas_coord_to_image_coord_percent(x_to, y_to, vis_meta, image_layer_state);

            this.props.tunnel_set_zoom_area(point_from.x, point_from.y, point_to.x, point_to.y);

            this.reset_data();
            this.data.is_zoom_in = true;

            // clear createjs overlay
            var overlay_canvas = document.getElementById(this.canvas_createjs_id);
            overlay_canvas.getContext('2d').clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);
            
            var mask_canvas = document.getElementById(this.props.canvas_id);
            mask_canvas.getContext('2d').clearRect(0, 0, mask_canvas.width, mask_canvas.height);

            this.props.tunnel_register_visualize_callback(this.draw_mask);
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

    convert_canvas_coord_to_image_coord_percent = (x, y, vis_meta, image_layer_state) => {
        const shift_x_px = (vis_meta.viewing_canvas_width_px - vis_meta.viewing_image_width_px)/2;
        const shift_y_px = (vis_meta.viewing_canvas_height_px - vis_meta.viewing_image_height_px)/2;

        var xshift = (x - shift_x_px)/vis_meta.viewing_image_width_px;
        var yshift = (y - shift_y_px)/vis_meta.viewing_image_height_px;

        const ratio_w = image_layer_state.zoom_xmax - image_layer_state.zoom_xmin;
        const ratio_h = image_layer_state.zoom_ymax - image_layer_state.zoom_ymin;

        return {
            x: image_layer_state.zoom_xmin + ratio_w*xshift,
            y: image_layer_state.zoom_ymin + ratio_h*yshift,
            shift_x_px: shift_x_px,
            shift_y_px: shift_y_px,
        };
    }

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
        //this.draw_mask();
    }

    render() {
        const { classes, width, height, canvas_id } = this.props;
        const total_images = this.props.tunnel_retrieve_medical_images().length;
        const active_idx = this.props.tunnel_retrieve_state().active_idx;

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
                    <div style={{marginBottom: "0.5em", textAlign: "center"}}><span className={classes.pos_text_info}>{active_idx+1} / {total_images}</span></div>
                    <IconButton onClick={this.activate_zoom_in} id={this.zoom_in_button_id} className={classes.icon_button}
                        style={{display: "block"}}><ZoomIn className={classes.icon} fontSize="large"/></IconButton>
                    <IconButton onClick={this.reset_zoom} id={this.zoom_reset_button_id} className={classes.icon_button}
                        style={{display: "block"}}><ZoomOut className={classes.icon} fontSize="large"/></IconButton>
                    
                    <IconButton onClick={this.full_screen} id={this.full_screen_button_id} className={classes.icon_button}
                        style={{display: "block"}}><Fullscreen className={classes.icon} fontSize="large"/></IconButton>
                    <IconButton onClick={this.restore_screen} id={this.restore_screen_button_id} className={classes.icon_button}
                        style={{display: "none"}}><FullscreenExit className={classes.icon} fontSize="large"/></IconButton>
                    
                    <IconButton onClick={this.show_mask_editor} id={this.show_mask_editor_button_id} className={classes.icon_button}
                        style={{display: "block"}}><Layers className={classes.icon} fontSize="large"/></IconButton>
                    <IconButton onClick={this.close_mask_editor} id={this.close_mask_editor_button_id} className={classes.icon_button}
                        style={{display: "none"}}><Layers className={classes.icon} fontSize="large"/></IconButton>
                </div>

                <div id={this.mask_layers_editor_id} 
                    style={{position: "absolute", right: "0px", top: "0px", zIndex: "100", margin: "0.5em", display: "none"}}
                    className={classes.pos_text_info}>
                </div>

            </div>
        )
    }
}

GVMedicalOverlay.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GVMedicalOverlay);
