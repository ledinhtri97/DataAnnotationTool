
class MedicalChartBox {
    static chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };
    
    static chart_js_config = {
        data: {
            datasets: [
            {
                type: 'scatter',
                backgroundColor: Chart.helpers.color(MedicalChartBox.chartColors.yellow).alpha(0.5).rgbString(),
                borderColor: MedicalChartBox.chartColors.yellow,
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
                backgroundColor: Chart.helpers.color(MedicalChartBox.chartColors.yellow).alpha(0.5).rgbString(),
                borderColor: MedicalChartBox.chartColors.yellow,
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
            responsive: false,
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
            self.gvc.set_lookup_table(g_data.lookup_table, scatter_ds.data, x_start, x_stop, y_min, y_max);
            
            console.log("scatter_ds.data");
            console.log(scatter_ds.data);
            self.hounsfield_indicator.render();
        }
    }

    static chart_canvas_mouse_up = (e, self) => {
        self.chart_data.up_x = e.nativeEvent.offsetX;
        self.chart_data.up_y = e.nativeEvent.offsetY;
        self.chart_data.is_keeping_mouse_down = false;

        const is_click = Math.abs(self.chart_data.up_x-self.chart_data.down_x)<5 && Math.abs(self.chart_data.up_y-self.chart_data.down_y)<5;
        if (is_click) {
            if (e.nativeEvent.which === 3) { // right click
                // remove point instead of adding new point
                const chart_point = MedicalChartBox.canvas_px_to_chart_value(self.chart_data.down_x, self.chart_data.down_y, self);
                var to_remove_idx = [];
                for (var i=0; i<self.chart_js_obj.data.datasets[0].data.length; i++) {
                    var point = self.chart_js_obj.data.datasets[0].data[i];

                    if (Math.abs(point.x-chart_point.x)/self.chart_data.x_range<0.05 && Math.abs(point.y-chart_point.y)/self.chart_data.y_range<0.05) {
                        const idx = i;
                        to_remove_idx.push(idx);
                    }
                }

                for (var i=to_remove_idx.length-1; i>=0; i--) {
                    self.chart_js_obj.data.datasets[0].data.splice(to_remove_idx[i], 1);
                }

                // generate line data
                const scatter_ds = self.chart_js_obj.data.datasets[0];
                const line_ds = self.chart_js_obj.data.datasets[1];
                line_ds.data.splice(0);
                const x_start = scatter_ds.data[0].x;
                const x_stop = scatter_ds.data[scatter_ds.data.length-1].x;
                var g_data = MedicalChartBox.generate_line_data(scatter_ds.data, x_start, x_stop, 0, 255);
                line_ds.data = g_data.points;

                self.chart_js_obj.update();
                self.gvc.set_lookup_table(g_data.lookup_table, scatter_ds.data, x_start, x_stop, 0, 255);
                self.hounsfield_indicator.render();
            } else {
                // do no thing
                const scatter_ds = self.chart_js_obj.data.datasets[0];
                console.log("* scatter_ds.data:");
                console.log(scatter_ds.data);
            }
        }

        if (self.chart_data.down_point_close_idx >= 0) {
            self.chart_data.down_point_close_idx = -1;
        }
    }

    static update_chartjs_UI = (self, scatter_data, line_data) => {
        self.init_chart_if_not_rendered();
        self.chart_js_obj.data.datasets[0].data = scatter_data;
        self.chart_js_obj.data.datasets[1].data = line_data;
        self.chart_js_obj.update();
        //self.hounsfield_indicator.render();
    }

    static set_chart_for_contrast = (self, xmin, ymin, xmax, ymax) => {
        const cornerstone_image = self.gvc.medical_images[self.gvc.state.active_idx].cornerstone_image;

        // extract data from voxel matrix
        var z_xmin = Math.min(xmin, xmax);
        var z_ymin = Math.min(ymin, ymax);
        var z_xmax = Math.max(xmin, xmax);
        var z_ymax = Math.max(ymin, ymax);
        var x1 = parseInt(z_xmin * cornerstone_image.width);
        var y1 = parseInt(z_ymin * cornerstone_image.height);
        var x2 = parseInt(z_xmax * cornerstone_image.width);
        var y2 = parseInt(z_ymax * cornerstone_image.height);
        const cs_data = cornerstone_image.getPixelData();
        var to_loc1d = (x, y) => (y*cornerstone_image.width+x);
        var is_valid_xy = (x, y) => x>=0 && y>=0 && x<cornerstone_image.width && y<cornerstone_image.height;
        
        var voxel_min_value = Number.MAX_SAFE_INTEGER;
        var voxel_max_value = Number.MIN_SAFE_INTEGER;
        
        const slope = cornerstone_image.slope;
        const intercept = cornerstone_image.intercept;

        for (var x=x1; x<=x2; x++) {
            for (var y=y1; y<=y2; y++) {
                if (!is_valid_xy(x, y)) {
                    continue;
                }
                var xy_1d = to_loc1d(x, y);
                const voxel_value = cs_data[xy_1d]*slope+intercept;
                if (voxel_value < voxel_min_value) {
                    voxel_min_value = voxel_value;
                }
                if (voxel_value > voxel_max_value) {
                    voxel_max_value = voxel_value;
                }
            }
        }

        var scatter_data = [
            { x: voxel_min_value, y: 0 },
            { x: voxel_max_value, y: 255 },
        ];
        MedicalChartBox.set_chart(self, scatter_data);
    }

    static set_chart_for_default = (self) => {
        var min_hounsfield = self.chart_data.min_hounsfield;
        var max_hounsfield = self.chart_data.max_hounsfield;
        var scatter_data = [
            { x: min_hounsfield, y: 0 },
            { x: max_hounsfield, y: 255 },
        ];
        MedicalChartBox.set_chart(self, scatter_data);
    }

    static set_chart_for_liver = (self) => { // 60 +- 6
        var scatter_data = [
            { x: -385, y: 0 },
            { x: 36, y: 186 },
            { x: 95, y: 250 },
            { x: 188, y: 47 },
            { x: 550, y: 0 },
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
            { x: -1024, y: 0 },
            { x: -555, y: 0 },
            { x: -300, y: 0 },
            { x: -125, y: 120 },
            { x: -60, y: 220 },            
            { x: 16, y: 25 },
            { x: 290, y: 250 },
            { x: 395, y: 140 },
            { x: 457, y: 0 },            
        ];
        MedicalChartBox.set_chart(self, scatter_data);
    }

    static set_chart = (self, scatter_data) => {
        const xmin = scatter_data[0].x;
        const xmax = scatter_data[scatter_data.length-1].x;
        const ymin = 0;
        const ymax = 255;
        var g_data = MedicalChartBox.generate_line_data(scatter_data, xmin, xmax, ymin, ymax);
        self.gvc.set_lookup_table(g_data.lookup_table, scatter_data, xmin, xmax, ymin, ymax);
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
    
}

export default MedicalChartBox;
