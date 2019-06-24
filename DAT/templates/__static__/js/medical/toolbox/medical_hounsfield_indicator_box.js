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
            document.getElementById(this.hounsfield_indicator_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd"; // yellow
            //document.getElementById(this.hounsfield_indicator_canvas_id).style.display = "block";
        } else {
            document.getElementById(this.hounsfield_indicator_button_id).getElementsByTagName("svg")[0].style.color = "#ffffffdd"; // white
            //document.getElementById(this.hounsfield_indicator_canvas_id).style.display = "none";
            this.overlay.surface._clear_surface();
        }
    }

    add_region = (xfrom, yfrom, xto, yto) => {
        this.data.push({
            xfrom: xfrom,
            yfrom: yfrom,
            xto: xto,
            yto: yto
        })
    }

    delete_region = (x, y) => {
        if (this.is_active()) {
            return;
        }

        var best_idx = -1;
        var area = Number.MAX_SAFE_INTEGER;
        for(var d=0; d<this.data.length; d++) {
            var rect = this.data[d];
            var r_area = Math.abs(rect.xto-rect.xfrom)*Math.abs(rect.yto-rect.yfrom);
            if (x >= rect.xfrom && x <= rect.xto && y >= rect.yfrom && y <= rect.yto && r_area < area) {
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

    render = () => {
        const color = this.border_color;
        const auto_clear = false;
        const is_dash = false;
        this.clear();
        for(var d=0; d<this.data.length; d++) {
            var rect = this.data[d];
            MedicalGeometryBox.draw_rect(this.hounsfield_indicator_canvas_id, 
                rect.xfrom, 
                rect.yfrom, 
                rect.xto-rect.xfrom, 
                rect.yto-rect.yfrom,
                color,
                auto_clear,
                is_dash);

            const c_width = document.getElementById(this.hounsfield_indicator_canvas_id).width;
            const c_height = document.getElementById(this.hounsfield_indicator_canvas_id).height;

            const medical_image = this.overlay.gvc.medical_images[this.overlay.gvc.state.active_idx];
            const cornerstone_image = medical_image.cornerstone_image;
            const intensity_image = medical_image.intensity_image;
            
            // extract data from voxel matrix
            var x1 = parseInt(rect.xfrom / c_width * cornerstone_image.width);
            var y1 = parseInt(rect.yfrom / c_height * cornerstone_image.height);
            var x2 = parseInt(rect.xto / c_width * cornerstone_image.width);
            var y2 = parseInt(rect.yto / c_height * cornerstone_image.height);
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
            x1 = parseInt(rect.xfrom / c_width * intensity_image.cols);
            y1 = parseInt(rect.yfrom / c_height * intensity_image.rows);
            x2 = parseInt(rect.xto / c_width * intensity_image.cols);
            y2 = parseInt(rect.yto / c_height * intensity_image.rows);
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
                rect.xfrom, rect.yto);
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
