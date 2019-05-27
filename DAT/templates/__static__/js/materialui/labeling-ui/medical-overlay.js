import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    createjs_canvas: {
        position: "absolute", 
        top: "0px", 
        left: "0px",         
        zIndex: "10"
    },
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
        }
    }
    
    mouse_up = (event) => {
        if (event.nativeEvent.which === 3) { // no processing on right click
            return;
        } 
        
        if (this.data.is_ready_to_zoom_in) {
            // do zoom in action            
            const x_from = this.data.zoom_from_x;
            const y_from = this.data.zoom_from_y;
            const x_to = event.nativeEvent.offsetX;
            const y_to = event.nativeEvent.offsetY;

            this.props.visualize(x_from, y_from, x_to, y_to);

            this.reset_data();
            this.data.is_zoom_in = true;
            // clear overlay
            var overlay_canvas = document.getElementById(this.props.canvas_id);
            overlay_canvas.getContext('2d').clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);
            document.getElementById(this.zoom_reset_button_id).style.display = "block";
        }
    }

    activate_zoom_in = () => {
        document.getElementById(this.props.canvas_id).style.cursor = "crosshair";
        this.data.is_ready_to_zoom_in = true;
        document.getElementById(this.zoom_in_button_id).style.display = "none";
    }
    
    reset_zoom = () => {
        this.reset_data();
        this.props.visualize();
        document.getElementById(this.zoom_in_button_id).style.display = "block";
        document.getElementById(this.zoom_reset_button_id).style.display = "none";
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
            // activate zoom-in or reset zoom
            if ((!this.data.is_zoom_in) && (!this.data.is_ready_to_zoom_in)) {
                this.activate_zoom_in();
                e.preventDefault();
            } else if (this.data.is_zoom_in) {
                this.reset_zoom();
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
                <button onClick={this.activate_zoom_in} id={this.zoom_in_button_id}
                    style={{position: "absolute", left: "0px", bottom: "0px", zIndex: "100", display: "block"}}>Zoom+</button>
                <button onClick={this.reset_zoom} id={this.zoom_reset_button_id}
                    style={{position: "absolute", left: "0px", bottom: "0px", zIndex: "100", display: "none"}}>Reset Zoom</button>
                <button onClick={this.full_screen} id={this.full_screen_button_id}
                    style={{position: "absolute", right: "0px", bottom: "0px", zIndex: "100"}}>Full Screen</button>
                <button onClick={this.restore_screen} id={this.restore_screen_button_id}
                    style={{position: "absolute", right: "0px", bottom: "0px", zIndex: "100", display: "none"}}>Restore Screen</button>
            </div>
        )
    }
}

GVMedicalOverlay.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GVMedicalOverlay);
