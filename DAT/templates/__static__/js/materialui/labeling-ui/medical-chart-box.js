
class MedicalChartBox {
    static mouse_down = (event, overlay_obj) => {
        if (event.nativeEvent.which === 3) { // no processing on right click
            return;
        }

        if (overlay_obj.data.is_ready_to_zoom_in) {
            overlay_obj.data.zoom_from_x = event.nativeEvent.offsetX;
            overlay_obj.data.zoom_from_y = event.nativeEvent.offsetY;
            overlay_obj.data.is_chosen_zoom_from = true;
        //} else if (!this.data.is_zoom_in) {
        } else {
            // apply region growing algorithm
            const x = event.nativeEvent.offsetX;
            const y = event.nativeEvent.offsetY;
            const vis_meta = overlay_obj.props.tunnel_retrieve_vis_meta();
            const image_layer_state = overlay_obj.props.tunnel_retrieve_state();
            const point2d = MedicalChartBox.convert_canvas_coord_to_image_coord_percent(x, y, vis_meta, image_layer_state);
            
            if (point2d.x < 0 || point2d.y < 0 || point2d.x > 1 || point2d.y > 1) {
                return;
            }

            overlay_obj.props.tunnel_region_growing(point2d.x, point2d.y);
            overlay_obj.draw_mask();
        }
    }

    static mouse_up = (event, overlay_obj) => {
        if (event.nativeEvent.which === 3) {
            // no processing on left or right click, we did it on mouse_down
            return;
        } 
        
        if (overlay_obj.data.is_ready_to_zoom_in) {
            // do zoom in action            
            const x_from = overlay_obj.data.zoom_from_x;
            const y_from = overlay_obj.data.zoom_from_y;
            const x_to = event.nativeEvent.offsetX;
            const y_to = event.nativeEvent.offsetY;

            const vis_meta = overlay_obj.props.tunnel_retrieve_vis_meta();
            const image_layer_state = overlay_obj.props.tunnel_retrieve_state();

            const point_from = MedicalChartBox.convert_canvas_coord_to_image_coord_percent(x_from, y_from, vis_meta, image_layer_state);
            const point_to = MedicalChartBox.convert_canvas_coord_to_image_coord_percent(x_to, y_to, vis_meta, image_layer_state);

            overlay_obj.props.tunnel_set_zoom_area(point_from.x, point_from.y, point_to.x, point_to.y);

            overlay_obj.reset_data();
            overlay_obj.data.is_zoom_in = true;

            // clear createjs overlay
            var overlay_canvas = document.getElementById(overlay_obj.canvas_createjs_id);
            overlay_canvas.getContext('2d').clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);
            
            var mask_canvas = document.getElementById(overlay_obj.props.canvas_id);
            mask_canvas.getContext('2d').clearRect(0, 0, mask_canvas.width, mask_canvas.height);

            overlay_obj.props.tunnel_register_visualize_callback(overlay_obj.draw_mask);
        }
    }

    static mouse_move = (event, self) => {
        const offsetX = event.nativeEvent.offsetX;
        const offsetY = event.nativeEvent.offsetY;
        const imgWidth = self.props.width;
        const imgHeight = self.props.height;

        const overlay_canvas_id = self.canvas_createjs_id;

        if (self.data.is_ready_to_zoom_in) {
            self.focus_on_mouse(overlay_canvas_id, offsetX, offsetY, imgWidth, imgHeight);
        }

        if (self.data.is_chosen_zoom_from) {
            // draw rectangle from zoom_from to current mouse pointer
            self.draw_rect(overlay_canvas_id, 
                self.data.zoom_from_x, 
                self.data.zoom_from_y, 
                offsetX-self.data.zoom_from_x, 
                offsetY-self.data.zoom_from_y);
        }
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

    static canvas_px_to_chart_value = (x, y, self) => {
        let scaleRef, valueX, valueY;                            
        for (var scaleKey in self.chart_js_obj.scales) {
            scaleRef = self.chart_js_obj.scales[scaleKey];
            if (scaleRef.isHorizontal() && scaleKey == 'x-axis-0') {
                valueX = scaleRef.getValueForPixel(x);
            } else if (scaleKey == 'y-axis-0') {
                valueY = scaleRef.getValueForPixel(y);
            }
        }
        return {
            x: valueX,
            y: valueY
        }
    }

    static find_closest_point = (chart_x, chart_y, self) => {
        var min_dist = -1;
        var point_idx = -1;
        for (var i=0; i<self.chart_js_obj.data.datasets[0].data.length; i++) {
            var point = self.chart_js_obj.data.datasets[0].data[i];
            const dist_x = Math.abs(point.x-chart_x)/self.chart_data.x_range;
            const dist_y = Math.abs(point.y-chart_y)/self.chart_data.y_range;
            if (dist_x<0.05 && dist_y<0.05) {
                if (min_dist<0 || dist_x+dist_y<min_dist) {
                    min_dist = dist_x + dist_y;
                    point_idx = i;
                }
            }
        }
        return {
            min_dist: min_dist,
            idx: point_idx
        }
    }

    static chart_canvas_mouse_down = (e, self) => {
        self.chart_data.down_x = e.nativeEvent.offsetX;
        self.chart_data.down_y = e.nativeEvent.offsetY;
        if (e.nativeEvent.which !== 3) {
            self.chart_data.is_keeping_mouse_down = true;
        }
        
        const chart_point = MedicalChartBox.canvas_px_to_chart_value(self.chart_data.down_x, self.chart_data.down_y, self);
        const result = MedicalChartBox.find_closest_point(chart_point.x, chart_point.y, self);
        self.chart_data.down_point_close_idx = result.idx;

        if (self.chart_data.down_point_close_idx >= 0 && e.nativeEvent.which !== 3) { // remove close point
            self.chart_js_obj.data.datasets[0].data.splice(self.chart_data.down_point_close_idx, 1);
            self.chart_data.down_point_close_idx = -1;
        }
    }

    static chart_canvas_mouse_move = (e, self) => {
        const move_x = e.nativeEvent.offsetX;
        const move_y = e.nativeEvent.offsetY;
        /////const is_click = Math.abs(move_x-self.chart_data.down_x)<5 && Math.abs(move_y-self.chart_data.down_y)<5;
        if (self.chart_data.is_keeping_mouse_down) {
            if (self.chart_data.down_point_close_idx >= 0) {
                self.chart_js_obj.data.datasets[0].data.splice(self.chart_data.down_point_close_idx, 1);
                self.chart_data.down_point_close_idx = -1;
            }
            const chart_point = MedicalChartBox.canvas_px_to_chart_value(move_x, move_y, self);
            const x_min = self.chart_data.min_hounsfield;
            const x_max = self.chart_data.max_hounsfield;
            const y_min = 0;
            const y_max = 255;
            chart_point.x = (chart_point.x<x_min)?x_min:chart_point.x;
            chart_point.y = (chart_point.y<y_min)?y_min:chart_point.y;
            chart_point.x = (chart_point.x>x_max)?x_max:chart_point.x;
            chart_point.y = (chart_point.y>y_max)?y_max:chart_point.y;

            const scatter_ds = self.chart_js_obj.data.datasets[0];
            //self.chart_js_obj.data.datasets.forEach((dataset) => {
            scatter_ds.data.push({
                x: chart_point.x,
                y: chart_point.y,
            });
            scatter_ds.data.sort(function(a, b){
                if (a.x < b.x) return -1;
                if (a.x > b.x) return 1;
                return 0;
            });
            //});
            
            // generate line data
            const line_ds = self.chart_js_obj.data.datasets[1];
            line_ds.data.splice(0);
            const x_start = scatter_ds.data[0].x;
            const x_stop = scatter_ds.data[scatter_ds.data.length-1].x;
            var g_data = MedicalChartBox.generate_line_data(scatter_ds.data, x_start, x_stop, y_min, y_max);
            line_ds.data = g_data.points;

            self.chart_js_obj.update();
            const result = MedicalChartBox.find_closest_point(chart_point.x, chart_point.y, self);
            self.chart_data.down_point_close_idx = result.idx;            

            ////const lookup_table = MedicalChartBox.export_lookup_table_from_chart(self.chart_js_obj, self);
            self.props.tunnel_set_lookup_table(g_data.lookup_table, scatter_ds.data, x_start, x_stop, y_min, y_max);
            
            console.log("scatter_ds.data");
            console.log(scatter_ds.data);

        }
    }

    static update_chartjs_UI = (self, scatter_data, line_data) => {
        self.init_chart_if_not_rendered();
        self.chart_js_obj.data.datasets[0].data = scatter_data;
        self.chart_js_obj.data.datasets[1].data = line_data;
        self.chart_js_obj.update();
    }

    static set_chart_for_liver = (self) => { // 60 +- 6
        var scatter_data = [
            { x: 30, y: 0 },
            { x: 95, y: 250 },
            { x: 170, y: 0 },
        ];
        MedicalChartBox.set_chart(self, scatter_data);
    }

    static set_chart_for_lung = (self) => {
        var scatter_data = [
            { x: -1000, y: 0 },
            { x: -700, y: 250 },
            { x: -400, y: 0 },
        ];
        MedicalChartBox.set_chart(self, scatter_data);        
    }

    static set_chart_for_blood_vessel = (self) => {
        var scatter_data = [
            { x: -1000, y: 0 },
            { x: -700, y: 250 },
            { x: -463, y: 60 },
            { x: -81, y: 205 },
            { x: 144, y: 27 },
        ];
        MedicalChartBox.set_chart(self, scatter_data);
    }

    static set_chart = (self, scatter_data) => {
        const xmin = scatter_data[0].x;
        const xmax = scatter_data[scatter_data.length-1].x;
        const ymin = 0;
        const ymax = 255;
        var g_data = MedicalChartBox.generate_line_data(scatter_data, xmin, xmax, ymin, ymax);
        self.props.tunnel_set_lookup_table(g_data.lookup_table, scatter_data, xmin, xmax, ymin, ymax);
        MedicalChartBox.update_chartjs_UI(self, scatter_data, g_data.points);
    }

    static generate_line_data = (scatter_points, x_min, x_max, y_min, y_max) => {
        var xs = []; 
        var ys = [];
        for(var idx=0; idx < scatter_points.length; idx++){
            xs.push(scatter_points[idx].x);
            ys.push(scatter_points[idx].y);
        }
        
        var points = [];
        var lookup_table = {};
        for(var x = x_min; x <= x_max; x += 1) {
            var y = spline(x, xs, ys);
            y = (y>y_max)?y_max:y;
            y = (y<y_min)?y_min:y;
            points.push({
                x: x,
                y: y,
            });
            lookup_table[Math.floor(x)] = Math.floor(y);
        }
        return {
            points: points,
            lookup_table: lookup_table
        };
    }

    static chart_canvas_mouse_up = (e, self) => {
        self.chart_data.up_x = e.nativeEvent.offsetX;
        self.chart_data.up_y = e.nativeEvent.offsetY;
        self.chart_data.is_keeping_mouse_down = false;

        const is_click = Math.abs(self.chart_data.up_x-self.chart_data.down_x)<5 && Math.abs(self.chart_data.up_y-self.chart_data.down_y)<5;
        if (is_click) {
            if (e.nativeEvent.which === 3) { // right click
                console.log("right click on chart");
                console.log("chart_data");
                console.log(self.chart_data);
                console.log("self.chart_js_obj.data.datasets[0].data");
                console.log(self.chart_js_obj.data.datasets[0].data);
                
                // remove point instead of adding new point
                const chart_point = MedicalChartBox.canvas_px_to_chart_value(self.chart_data.down_x, self.chart_data.down_y, self);
                var to_remove_idx = [];
                for (var i=0; i<self.chart_js_obj.data.datasets[0].data.length; i++) {
                    var point = self.chart_js_obj.data.datasets[0].data[i];

                    console.log("point");
                    console.log(point);
                    console.log("chart_point");
                    console.log(chart_point);

                    if (Math.abs(point.x-chart_point.x)/self.chart_data.x_range<0.05 && Math.abs(point.y-chart_point.y)/self.chart_data.y_range<0.05) {
                        const idx = i;
                        to_remove_idx.push(idx);
                    }
                }

                console.log("to_remove_idx");
                console.log(to_remove_idx);

                for (var i=to_remove_idx.length-1; i>=0; i--) {
                    self.chart_js_obj.data.datasets[0].data.splice(to_remove_idx[i], 1);
                }
                self.chart_js_obj.update();
            } else {
                // do no thing
            }
        }

        if (self.chart_data.down_point_close_idx >= 0) {
            self.chart_data.down_point_close_idx = -1;
        }
    }
}

export default MedicalChartBox;
