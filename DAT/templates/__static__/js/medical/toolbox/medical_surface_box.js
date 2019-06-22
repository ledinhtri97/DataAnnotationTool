import MedicalGeometryBox from './medical_geometry_box';

class MedicalSurfaceBox {
    overlay = null;
    gvc = null;
    canvas_surface_id = "";

    // states for zooming function
    is_zoom_in = false;
    is_ready_to_zoom_in = false;
    zoom_from_x = -1;
    zoom_from_y = -1;
    is_chosen_zoom_from = false;
    zoom_to_x = -1;
    zoom_to_y = -1;

    constructor(overlay, canvas_surface_id) {
        this.overlay = overlay;
        this.canvas_surface_id = canvas_surface_id;
    }

    mouse_down = (event) => {
        if (event.nativeEvent.which === 3) { // no processing on right click
            return;
        }

        if (this.is_ready_to_zoom_in) {
            this.zoom_from_x = event.nativeEvent.offsetX;
            this.zoom_from_y = event.nativeEvent.offsetY;
            this.is_chosen_zoom_from = true;
            return;
        } 
        
        if (this.overlay.brush_or_eraser && this.overlay.brush_or_eraser.is_active()) {
            this.overlay.brush_or_eraser.is_brushing = true;
            return;
        }

        {
            // apply region growing algorithm
            const x = event.nativeEvent.offsetX;
            const y = event.nativeEvent.offsetY;            
            const point2d = MedicalSurfaceBox.convert_canvas_coord_to_image_coord_percent(
                x, y, 
                this.overlay.gvc.vis_meta, 
                this.overlay.gvc.state);
            
            if (point2d.x < 0 || point2d.y < 0 || point2d.x > 1 || point2d.y > 1) { // invalid values
                return;
            }

            this.overlay.gvc.region_growing(point2d.x, point2d.y);
            this.overlay.draw_mask();
        }
    }

    mouse_up = (event) => {
        if (event.nativeEvent.which === 3) {
            // no processing on left or right click, we did it on mouse_down
            return;
        } 
        
        if (this.is_ready_to_zoom_in) {
            // do zoom in action            
            const x_from = this.zoom_from_x;
            const y_from = this.zoom_from_y;
            const x_to = event.nativeEvent.offsetX;
            const y_to = event.nativeEvent.offsetY;

            const vis_meta = this.overlay.gvc.vis_meta;
            const image_layer_state = this.overlay.gvc.state;

            const point_from = MedicalSurfaceBox.convert_canvas_coord_to_image_coord_percent(x_from, y_from, vis_meta, image_layer_state);
            const point_to = MedicalSurfaceBox.convert_canvas_coord_to_image_coord_percent(x_to, y_to, vis_meta, image_layer_state);

            this.overlay.gvc.set_zoom_area(point_from.x, point_from.y, point_to.x, point_to.y);

            this._reset();
            this.is_zoom_in = true;

            // clear createjs overlay
            this._clear_surface();
            this.overlay._clear_mask_layer();
            this.overlay.gvc.register_visualize_callback(this.overlay.draw_mask);
            return;
        }

        if (this.overlay.brush_or_eraser && this.overlay.brush_or_eraser.is_active()) {
            this.overlay.brush_or_eraser.is_brushing = false;
            return;
        }
    }

    mouse_move = (event) => {
        const offsetX = event.nativeEvent.offsetX;
        const offsetY = event.nativeEvent.offsetY;
        
        if (this.overlay.brush_or_eraser && this.overlay.brush_or_eraser.is_active()) {
            if (this.overlay.brush_or_eraser.is_brushing) {
                const point2d = MedicalSurfaceBox.convert_canvas_coord_to_image_coord_percent(
                    offsetX, offsetY, 
                    this.overlay.gvc.vis_meta, 
                    this.overlay.gvc.state);
                    
                if (point2d.x < 0 || point2d.y < 0 || point2d.x > 1 || point2d.y > 1) { // invalid values
                    // do nothing
                } else {
                    var mask_idx = -1;
                    var active_label_id = this.overlay.props.medical_label_state.getLabelId();
                    var m = this.overlay.gvc.labeling_mask_layers[this.overlay.gvc.state.active_idx]
                    if (m.length>0 && parseInt(m[m.length-1].label_id) == parseInt(active_label_id)) {
                        mask_idx = m.length-1;
                    }
                    this.overlay.gvc.brush_point_at(point2d.x, point2d.y, 
                        this.overlay.brush_or_eraser.brush_radius, 
                        this.overlay.brush_or_eraser.brush_shape,
                        mask_idx,
                        this.overlay.brush_or_eraser.is_eraser);
                    this.overlay.draw_mask();
                }
            }

            MedicalGeometryBox.draw_brush(this.canvas_surface_id, 
                offsetX, 
                offsetY, 
                this.overlay.brush_or_eraser.brush_radius,
                this.overlay.brush_or_eraser.brush_color);
            
            return;
        }

        if (this.is_ready_to_zoom_in) {
            this._focus_on_mouse(this.canvas_surface_id, offsetX, offsetY, this.overlay.props.width, this.overlay.props.height);
        }

        if (this.is_chosen_zoom_from) {
            // draw rectangle from zoom_from to current mouse pointer
            MedicalGeometryBox.draw_rect(this.canvas_surface_id, 
                this.zoom_from_x, 
                this.zoom_from_y, 
                offsetX-this.zoom_from_x, 
                offsetY-this.zoom_from_y);
        }
    }

    handle_click = (e) => {
        if (e.nativeEvent.which === 1) {
            console.log("Left Click");
        } else if (e.nativeEvent.which === 3) {
            // reset zoom if being zoom in
            if (this.is_zoom_in) {
                this.reset_zoom();
                e.preventDefault();
            } else if (this.last_action == "full_screen") {
                this.restore_screen();
                e.preventDefault();
            }
        }
    }

    /*on_wheel = (e) => {
        console.log("on wheel ()");
        console.log(e);
        if(e.Delta > 0) {
            // The user scrolled up.
            this.overlay.brush.brush_radius += 1;
        } else {
            // The user scrolled down.
            this.overlay.brush.brush_radius -= 1;
            this.overlay.brush.brush_radius = (this.overlay.brush.brush_radius<0)?0:this.overlay.brush.brush_radius;
        }
    }*/

    _reset = () => {
        this.is_zoom_in = false;
        this.is_ready_to_zoom_in = false;
        this.zoom_from_x = -1;
        this.zoom_from_y = -1;
        this.is_chosen_zoom_from = false;
        this.zoom_to_x = -1;
        this.zoom_to_y = -1;
        
        this._cursor_default();
    }

    _clear_surface = () => {
        var surface_canvas = document.getElementById(this.canvas_surface_id);
        surface_canvas.getContext('2d').clearRect(0, 0, surface_canvas.width, surface_canvas.height);        
    }
    
    _focus_on_mouse = (canvasId, offsetX, offsetY, imgWidth, imgHeight, color) => {
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

    label_selected = () => {
        console.log('Overlay > label_selected()');
        const label_id = this.overlay.props.medical_label_state.getLabelId();
        if (label_id > 0) {
            this.overlay.brush.show();
            this.overlay.eraser.show();
        } else {
            this.overlay.brush.hide();
            this.overlay.eraser.hide();
        }
    }    

    go_to_slice = (event) => {
        if (event.key === 'Enter') {
            if (!isNaN(this.overlay.state.idx) && this.overlay.state.idx.length > 0) { // input text is number
                this.overlay.gvc.sync_go_to_slice(parseInt(this.state.idx)-1);
            }     
        }     
    }

    _cursor_crosshair = () => {
        document.getElementById(this.canvas_surface_id).style.cursor = "crosshair";
    }

    _cursor_default = () => {
        document.getElementById(this.canvas_surface_id).style.cursor = "default";
    }

    _icon_color_on = (id) => {
        document.getElementById(id).getElementsByTagName("svg")[0].style.color = "#ffff00dd";  
    }

    _icon_color_off = (id) => {
        document.getElementById(id).getElementsByTagName("svg")[0].style.color = "#ffffffdd";
    }

    _show_icon = (id) => {        
        document.getElementById(id).style.display = "block";
    }

    _hide_icon = (id) => {
        document.getElementById(id).style.display = "none";
    }

    activate_zoom_in = () => {
        this._cursor_crosshair();
        this.is_ready_to_zoom_in = true;
        this._icon_color_on(this.overlay.ids.zoom_in_button_id);
        if (this.overlay.brush_or_eraser) {
            this.overlay.brush_or_eraser.stop_labeling();
        }
        return;
    }
    
    reset_zoom = () => {
        this._reset();
        this.overlay.gvc.set_zoom_area(0, 0, 1, 1);
        this._icon_color_off(this.overlay.ids.zoom_in_button_id);
        this.overlay.gvc.register_visualize_callback(this.overlay.draw_mask);
        return;
    }

    full_screen = () => {
        if (this.is_zoom_in) {
            this.reset_zoom();
        }

        var dom_griditem_container = document.getElementsByClassName("griditem_container"); // check medical-gvcornerstone.js > render()
        for(var i=0; i<dom_griditem_container.length; i++) {
            if(dom_griditem_container[i].id.indexOf(this.overlay.props.original_canvas_id) === -1) {
                dom_griditem_container[i].style.display = "none";
            }
        }
        this.overlay.gvc.set_total_items(1);
        this._hide_icon(this.overlay.ids.full_screen_button_id);
        this._show_icon(this.overlay.ids.restore_screen_button_id);
        this.last_action = "full_screen";
        this.overlay.gvc.register_visualize_callback(this.overlay.draw_mask);
        return;
    }

    restore_screen = () => { // reverse full_screen action
        if (this.is_zoom_in) {
            this.reset_zoom();
        }

        var dom_griditem_container = document.getElementsByClassName("griditem_container"); // check medical-gvcornerstone.js > render()
        for(var i=0; i<dom_griditem_container.length; i++) {
            if(dom_griditem_container[i].id.indexOf(this.overlay.props.original_canvas_id) === -1) {
                dom_griditem_container[i].style.display = "block";
            }
        }
        this.overlay.gvc.set_total_items(); // call with no param to restore "total_items" value

        this._show_icon(this.overlay.ids.full_screen_button_id);
        this._hide_icon(this.overlay.ids.restore_screen_button_id);

        this.overlay.gvc.register_visualize_callback(this.overlay.draw_mask);
        return;
    }

    static convert_canvas_coord_to_image_coord_percent = (x, y, vis_meta, image_layer_state) => {
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
}

export default MedicalSurfaceBox