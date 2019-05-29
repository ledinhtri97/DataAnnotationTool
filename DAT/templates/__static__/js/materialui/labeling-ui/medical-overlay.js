import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ZoomIn from '@material-ui/icons/ZoomIn';
import ZoomOut from '@material-ui/icons/ZoomOut';
import Fullscreen from '@material-ui/icons/Fullscreen';
import FullscreenExit from '@material-ui/icons/FullscreenExit';

const styles = theme => ({
    createjs_canvas: {
        position: "absolute", 
        top: "0px", 
        left: "0px",         
        zIndex: "10"
    },
    icon: {
        backgroundColor: "white",
    },
    icon_button: {
        paddingTop: "0px",
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

    last_action = "";

    constructor(props) {
        super(props);
        this.zoom_in_button_id = this.zoom_in_button_id + props.canvas_id;
        this.zoom_reset_button_id = this.zoom_reset_button_id + props.canvas_id;
        this.full_screen_button_id = this.full_screen_button_id + props.canvas_id;
        this.restore_screen_button_id = this.restore_screen_button_id + props.canvas_id;
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

    mouse_move = (event) => {    
        //console.log(event.nativeEvent.offsetX);
        //console.log(event.nativeEvent.offsetY);

        const offsetX = event.nativeEvent.offsetX;
        const offsetY = event.nativeEvent.offsetY;
        const imgWidth = this.props.width;
        const imgHeight = this.props.height;

        const overlay_canvas_id = this.props.canvas_id;

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
        } else if (!this.data.is_zoom_in) {

            console.log("Executing Region Growing!");

            // apply region growing algorithm
            const x = event.nativeEvent.offsetX;
            const y = event.nativeEvent.offsetY;
            const result = this.props.tunnel_region_growing(x, y);

            var pixel_xy = result.region;
            var cvmask = result.mask;

            var overlay_canvas = document.getElementById(this.props.canvas_id);
            var context = overlay_canvas.getContext("2d");
            var image_data = context.getImageData(0, 0, overlay_canvas.width, overlay_canvas.height);
            var pix = image_data.data;
            var to_loc1d = (x, y) => (y*overlay_canvas.width+x)*4;

            const segment_color_hex = this.props.medical_label_state.getColor().substr(1,6);
            var segment_r = parseInt(segment_color_hex.substr(0, 2), 16);
            var segment_g = parseInt(segment_color_hex.substr(2, 2), 16);
            var segment_b = parseInt(segment_color_hex.substr(4), 16);

            // modify image data
            if (cvmask) {
                console.log("Using cvmask!");
                for(var p=0; p<cvmask.rows*cvmask.cols; p++) {
                    if (cvmask.data[p] > 0) {
                        var loc1d = p * 4;
                        pix[loc1d] = segment_r;
                        pix[loc1d+1] = segment_g;
                        pix[loc1d+2] = segment_b;
                        pix[loc1d+3] = 127;     // alpha: opaque=255, transparent=0
                    }
                }
                cvmask.delete();
            } else {
                for(var p=0; p<pixel_xy.length; p++) {
                    var pos = pixel_xy[p];
                    var loc1d = to_loc1d(pos.x, pos.y);
                    pix[loc1d] = segment_r;
                    pix[loc1d+1] = segment_g;
                    pix[loc1d+2] = segment_b;
                    pix[loc1d+3] = 127;     // alpha: opaque=255, transparent=0
                }
            }

            context.putImageData(image_data, 0, 0);
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

            var vis_meta = this.props.tunnel_retrieve_vis_meta();
            const shift_x_px = (vis_meta.viewing_canvas_width_px - vis_meta.viewing_image_width_px)/2;
            const shift_y_px = (vis_meta.viewing_canvas_height_px - vis_meta.viewing_image_height_px)/2;

            var xmin = (x_from - shift_x_px)/vis_meta.viewing_image_width_px;
            var ymin = (y_from - shift_y_px)/vis_meta.viewing_image_height_px;
            var xmax = (x_to - shift_x_px)/vis_meta.viewing_image_width_px;
            var ymax = (y_to - shift_y_px)/vis_meta.viewing_image_height_px;

            const image_layer_state = this.props.tunnel_retrieve_state();
            console.log("overlay xyxy 1: " + xmin + " " + ymin + " " + xmax + " " + ymax);
            console.log("zoom_xmin 1: " + image_layer_state.zoom_xmin + " " + image_layer_state.zoom_ymin + " " + image_layer_state.zoom_xmax + " " + image_layer_state.zoom_ymax);

            var ratio_w = image_layer_state.zoom_xmax - image_layer_state.zoom_xmin;
            var ratio_h = image_layer_state.zoom_ymax - image_layer_state.zoom_ymin;

            xmin = image_layer_state.zoom_xmin + ratio_w*xmin;
            ymin = image_layer_state.zoom_ymin + ratio_h*ymin;
            xmax = image_layer_state.zoom_xmin + ratio_w*xmax;
            ymax = image_layer_state.zoom_ymin + ratio_h*ymax;

            console.log("overlay xyxy 2: " + xmin + " " + ymin + " " + xmax + " " + ymax);

            this.props.tunnel_set_zoom_area(xmin, ymin, xmax, ymax);
            /////this.props.visualize(x_from, y_from, x_to, y_to);

            this.reset_data();
            this.data.is_zoom_in = true;
            // clear overlay
            var overlay_canvas = document.getElementById(this.props.canvas_id);
            overlay_canvas.getContext('2d').clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);
        }
    }

    activate_zoom_in = () => {
        document.getElementById(this.props.canvas_id).style.cursor = "crosshair";
        this.data.is_ready_to_zoom_in = true;
        document.getElementById(this.zoom_in_button_id).getElementsByTagName("svg")[0].style.backgroundColor = "yellow";
        return;
    }
    
    reset_zoom = () => {
        this.reset_data();
        this.props.tunnel_set_zoom_area(0, 0, 1, 1);
        document.getElementById(this.zoom_in_button_id).getElementsByTagName("svg")[0].style.backgroundColor = "white";
        return;
    }

    full_screen = () => {
        if (this.data.is_zoom_in) {
            this.reset_zoom();
        }

        //var dom_canvas = document.getElementsByTagName("canvas");
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
        return;
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
        document.getElementById(this.props.canvas_id).style.cursor = "default";
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

    render() {
        const { classes, width, height, canvas_id } = this.props;
        return (
            <div>
                <canvas className={classes.createjs_canvas} 
                    id={canvas_id}
                    width={width+"px"} 
                    height={height+"px"} 
                    onMouseMove={this.mouse_move}
                    onMouseUp={this.mouse_up}
                    onMouseDown={this.mouse_down}
                    onContextMenu={this.handleClick}></canvas>
                <div style={{position: "absolute", left: "0px", bottom: "0px", zIndex: "100"}}>
                    <IconButton onClick={this.activate_zoom_in} id={this.zoom_in_button_id} className={classes.icon_button}
                        style={{display: "block"}}><ZoomIn className={classes.icon} color="primary" fontSize="large"/></IconButton>
                    <IconButton onClick={this.reset_zoom} id={this.zoom_reset_button_id} className={classes.icon_button}
                        style={{display: "block"}}><ZoomOut className={classes.icon} color="primary" fontSize="large"/></IconButton>
                    <IconButton onClick={this.full_screen} id={this.full_screen_button_id} className={classes.icon_button}
                        style={{display: "block"}}><Fullscreen className={classes.icon} color="primary" fontSize="large"/></IconButton>
                    <IconButton onClick={this.restore_screen} id={this.restore_screen_button_id} className={classes.icon_button}
                        style={{display: "none"}}><FullscreenExit className={classes.icon} color="primary" fontSize="large"/></IconButton>
                </div>
            </div>
        )
    }
}

GVMedicalOverlay.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GVMedicalOverlay);
