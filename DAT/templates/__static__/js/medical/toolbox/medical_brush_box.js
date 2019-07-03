import MedicalGeometryBox from './medical_geometry_box';
import MedicalSurfaceBox from './medical_surface_box';

class MedicalBrushBox {
    overlay = null;
    brush_button_id = "";
    brush_radius = 8;
    brush_shape = "circle"; // "circle" or "rectangle"
    is_brushing = false;
    is_eraser = false;
    brush_color = "#ffff00";

    constructor(overlay, brush_button_id, is_eraser) {
        this.overlay = overlay;
        this.brush_button_id = brush_button_id;

        if (is_eraser != undefined) {
            this.is_eraser = is_eraser;
            this.brush_color = "#ff0000";
        }
    }

    show = () => {
        document.getElementById(this.brush_button_id).style.display = "block";
    }

    hide = () => {
        document.getElementById(this.brush_button_id).style.display = "none";
    }

    is_active = () => {
        return document.getElementById(this.brush_button_id).getElementsByTagName("svg")[0].style.color == "rgba(255, 255, 0, 0.867)";
    }

    set_active = (is_active) => {
        if (is_active) {
            document.getElementById(this.brush_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd"; // yellow
        } else {
            document.getElementById(this.brush_button_id).getElementsByTagName("svg")[0].style.color = "#ffffffdd"; // white
        }
    }

    start_labeling = () => {
        if (!this.is_active()) {
            // start labeling with brush ...
            this.overlay._disable_conflict_features("brush");

            // change state
            this.set_active(true);
            this.overlay.brush_or_eraser = this;
        } else {
            this.stop_labeling();
        }
    }

    stop_labeling = () => {
        if (this.is_active()) {
            // stop labeling with brush ...
            // change state
            this.set_active(false);
            // clear canvas
            this.overlay.surface._clear_surface();
            this.overlay.brush_or_eraser = null;
        }
    }

    render = (canvas_surface_id, offsetX, offsetY) => {
        this.overlay.surface._clear_surface();
        MedicalGeometryBox.draw_brush(canvas_surface_id, 
            offsetX, 
            offsetY, 
            this.brush_radius,
            this.brush_color);
    }

    brush_on_surface = (offsetX, offsetY) => {
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
            if (m.length>0 && 
                parseInt(m[m.length-1].label_id) == parseInt(active_label_id) && 
                m[m.length-1].editable == true) {
                mask_idx = m.length-1;
            }

            // draw immediately on canvas
            var overlay_canvas = document.getElementById(this.overlay.props.canvas_id);
            var context = overlay_canvas.getContext("2d");
            var image_data = context.getImageData(0, 0, overlay_canvas.width, overlay_canvas.height);
            var pix = image_data.data;
            var to_loc1d = (x, y) => (y*overlay_canvas.width+x)*4;

            const segment_color_hex = this.overlay.props.medical_label_state.getColor().substr(1,6);
            var segment_r = parseInt(segment_color_hex.substr(0, 2), 16);
            var segment_g = parseInt(segment_color_hex.substr(2, 2), 16);
            var segment_b = parseInt(segment_color_hex.substr(4), 16);

            var brush_region_canvas_x_range = [offsetX - this.brush_radius, offsetX + this.brush_radius];
            var brush_region_canvas_y_range = [offsetY - this.brush_radius, offsetY + this.brush_radius];
            for (var x=brush_region_canvas_x_range[0]; x<=brush_region_canvas_x_range[1]; x++) {
                for (var y=brush_region_canvas_y_range[0]; y<=brush_region_canvas_y_range[1]; y++) {
                    if (x<0 || y<0 || x>=overlay_canvas.width || y>= overlay_canvas.height) {
                        continue
                    }

                    if (x<point2d.shift_x_px || y<point2d.shift_y_px || x>point2d.shift_x_px+this.overlay.gvc.vis_meta.viewing_image_width || y>point2d.shift_y_px+this.overlay.gvc.vis_meta.viewing_image_height_px) {
                        continue
                    }

                    if (this.brush_shape == "circle") {
                        const dist = Math.sqrt(Math.pow(x-offsetX, 2)+Math.pow(y-offsetY, 2));
                        if (dist > this.brush_radius) {
                            continue;
                        }
                    }

                    var loc1d = to_loc1d(x, y);
                    if (!this.is_eraser) {
                        pix[loc1d] = segment_r;
                        pix[loc1d+1] = segment_g;
                        pix[loc1d+2] = segment_b;
                        pix[loc1d+3] = 127;     // alpha: opaque=255, transparent=0
                    } else {
                        pix[loc1d+3] = 0;
                    }
                    
                }
            }
            context.putImageData(image_data, 0, 0);

            // sync down to data layer
            var self = this;
            setTimeout(function() {
                self.overlay.gvc.brush_point_at(point2d.x, point2d.y, 
                    self.brush_radius, 
                    self.brush_shape,
                    mask_idx,
                    self.is_eraser,
                    overlay_canvas.height);
                self.overlay.mask_editor.clean();
                self.overlay.mask_editor.render(active_label_id);
            }, 0);
        }
    }
}

export default MedicalBrushBox