import MedicalGeometryBox from './medical_geometry_box';

class MedicalHounsfieldIndicatorBox {
    overlay = null;
    hounsfield_indicator_button_id = "";
    hounsfield_indicator_canvas_id = "";
    data = [
        /*{
            xfrom: ...,
            yfrom: ...,
            xto: ...,
            yto: ...
        }*/
    ];

    border_color = "#ADBCE6";
    min_region_width = 20; // pixel
    min_region_height = 20; // pixel

    constructor(overlay, hounsfield_indicator_button_id, hounsfield_indicator_canvas_id) {
        this.overlay = overlay;
        this.hounsfield_indicator_button_id = hounsfield_indicator_button_id;
        this.hounsfield_indicator_canvas_id = hounsfield_indicator_canvas_id;
    }

    is_active = () => {
        return document.getElementById(this.hounsfield_indicator_button_id).getElementsByTagName("svg")[0].style.color == "rgba(255, 255, 0, 0.867)";
    }

    set_active = (is_active) => {
        if (is_active) {
            this.overlay._disable_conflict_features("hounsfield_indicator");
            document.getElementById(this.hounsfield_indicator_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd"; // yellow
            //document.getElementById(this.hounsfield_indicator_canvas_id).style.display = "block";
        } else {
            document.getElementById(this.hounsfield_indicator_button_id).getElementsByTagName("svg")[0].style.color = "#ffffffdd"; // white
            //document.getElementById(this.hounsfield_indicator_canvas_id).style.display = "none";
            this.overlay.surface._clear_surface();
        }
    }

    add_region = (xfrom_canvas_rel, yfrom_canvas_rel, xto_canvas_rel, yto_canvas_rel, xfrom_rel, yfrom_rel, xto_rel, yto_rel) => { // coords are relative values
        this.data.push({
            xfrom_canvas_rel: xfrom_canvas_rel,
            yfrom_canvas_rel: yfrom_canvas_rel,
            xto_canvas_rel: xto_canvas_rel,
            yto_canvas_rel: yto_canvas_rel,
            xfrom_rel: xfrom_rel,
            yfrom_rel: yfrom_rel,
            xto_rel: xto_rel,
            yto_rel: yto_rel,
        });
    }

    delete_region = (x, y) => {
        if (this.is_active()) {
            return;
        }

        var best_idx = -1;
        var area = Number.MAX_SAFE_INTEGER;
        for(var d=0; d<this.data.length; d++) {
            var rect = this.data[d];
            rect.xfrom_abs = parseInt(rect.xfrom_canvas_rel*this.overlay.surface._surface_width());
            rect.yfrom_abs = parseInt(rect.yfrom_canvas_rel*this.overlay.surface._surface_height());
            rect.xto_abs = parseInt(rect.xto_canvas_rel*this.overlay.surface._surface_width());
            rect.yto_abs = parseInt(rect.yto_canvas_rel*this.overlay.surface._surface_height());
            var r_area = Math.abs(rect.xto_abs-rect.xfrom_abs)*Math.abs(rect.yto_abs-rect.yfrom_abs);
            if (x >= rect.xfrom_abs && x <= rect.xto_abs && y >= rect.yfrom_abs && y <= rect.yto_abs && r_area < area) {
                area = r_area;
                best_idx = d;
            }
        }

        if (best_idx >= 0) {
            this.data.splice(best_idx, 1);
            this.render();
        }
    }

    clear = () => {
        var c = document.getElementById(this.hounsfield_indicator_canvas_id);
        c.getContext('2d').clearRect(0, 0, c.width, c.height);     
    }

    clean = () => {
        this.data = [];
        this.clear();
    }

    render = () => {
        const color = this.border_color;
        const auto_clear = false;
        const is_dash = false;
        this.clear();
        for(var d=0; d<this.data.length; d++) {
            var rect = this.data[d];
            rect.xfrom_abs = parseInt(rect.xfrom_canvas_rel*this.overlay.surface._surface_width());
            rect.yfrom_abs = parseInt(rect.yfrom_canvas_rel*this.overlay.surface._surface_height());
            rect.xto_abs = parseInt(rect.xto_canvas_rel*this.overlay.surface._surface_width());
            rect.yto_abs = parseInt(rect.yto_canvas_rel*this.overlay.surface._surface_height());
            MedicalGeometryBox.draw_rect(this.hounsfield_indicator_canvas_id, 
                rect.xfrom_abs, 
                rect.yfrom_abs, 
                rect.xto_abs-rect.xfrom_abs, 
                rect.yto_abs-rect.yfrom_abs,
                color,
                auto_clear,
                is_dash);

            const c_width = document.getElementById(this.hounsfield_indicator_canvas_id).width;
            const c_height = document.getElementById(this.hounsfield_indicator_canvas_id).height;

            const medical_image = this.overlay.gvc.medical_images[this.overlay.gvc.state.active_idx];
            const cornerstone_image = medical_image.cornerstone_image;
            const intensity_image = medical_image.intensity_image;
            
            // extract data from voxel matrix
            var x1 = parseInt(rect.xfrom_rel * cornerstone_image.width);
            var y1 = parseInt(rect.yfrom_rel * cornerstone_image.height);
            var x2 = parseInt(rect.xto_rel * cornerstone_image.width);
            var y2 = parseInt(rect.yto_rel * cornerstone_image.height);
            var extracted_voxel = [];
            const cs_data = cornerstone_image.getPixelData();
            var to_loc1d = (x, y) => (y*cornerstone_image.width+x);
            var is_valid_xy = (x, y) => x>=0 && y>=0 && x<cornerstone_image.width && y<cornerstone_image.height;
            for (var x=x1; x<=x2; x++) {
                for (var y=y1; y<=y2; y++) {
                    if (!is_valid_xy(x, y)) {
                        continue;
                    }
                    var xy_1d = to_loc1d(x, y);
                    extracted_voxel.push(cs_data[xy_1d]);
                }
            }

            // extract data from intensity matrix
            x1 = parseInt(rect.xfrom_rel * intensity_image.cols);
            y1 = parseInt(rect.yfrom_rel * intensity_image.rows);
            x2 = parseInt(rect.xto_rel * intensity_image.cols);
            y2 = parseInt(rect.yto_rel * intensity_image.rows);
            var extracted_pixel = [];
            to_loc1d = (x, y) => (y*intensity_image.cols*intensity_image.channels()+x*intensity_image.channels());
            is_valid_xy = (x, y) => x>=0 && y>=0 && x<intensity_image.cols && y<intensity_image.rows;
            for (var x=x1; x<=x2; x++) {
                for (var y=y1; y<=y2; y++) {
                    if (!is_valid_xy(x, y)) {
                        continue;
                    }
                    var xy_1d = to_loc1d(x, y);
                    extracted_pixel.push(intensity_image.data[xy_1d]);
                }
            }

            const voxel_stat = this.calc_mean_std_from_voxel_array(extracted_voxel, cornerstone_image.slope, cornerstone_image.intercept);
            const intensity_stat = this.calc_mean_std_from_voxel_array(extracted_pixel, 1, 0);
            this.draw_hounsfield_and_intensity_values(document.getElementById(this.hounsfield_indicator_canvas_id).getContext('2d'), 
                voxel_stat, 
                intensity_stat,
                rect.xfrom_abs, rect.yto_abs);
        }
    }

    draw_hounsfield_and_intensity_values = (ctx, hounsfield_info, intensity_info, x, y) => {
        ctx.font = "0.75em Arial";

        var txt = "H: " + hounsfield_info.mean.toFixed(0) + " ± " + hounsfield_info.std.toFixed(0) + " " +
        "(I: " + intensity_info.mean.toFixed(0) + ")";
        var width = ctx.measureText(txt).width;
        ctx.fillStyle = this.border_color;
        ctx.fillRect(x, y-10, width, parseInt(ctx.font, 10));
        
        ctx.fillStyle = "#000000";        
        ctx.fillText(txt, x, y);
    }

    calc_mean_std_from_voxel_array = (voxel_array_1d, slope, intercept) => {
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

    handle_click_hounsfield_indicator = () => {
        const isactive = this.is_active();
        this.set_active(!isactive);
    }
}

export default MedicalHounsfieldIndicatorBox
