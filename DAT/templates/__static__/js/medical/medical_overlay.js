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
import ShowChart from '@material-ui/icons/ShowChart';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Brush from '@material-ui/icons/Brush';
import RadioButtonUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import Colorize from '@material-ui/icons/Colorize';
import Exposure from '@material-ui/icons/Exposure';

import MedicalImageProcessingBox from './toolbox/medical_image_processing_box';
import MedicalChartBox from './toolbox/medical_chart_box';
import MedicalSurfaceBox from './toolbox/medical_surface_box';
import MedicalBrushBox from './toolbox/medical_brush_box';
import MedicalHounsfieldIndicatorBox from './toolbox/medical_hounsfield_indicator_box';
import MedicalContrastModeBox from './toolbox/medical_contrast_mode_box';
import MedicalMaskEditorBox from './toolbox/medical_mask_editor_box';

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
        minWidth: '40px',
        maxWidth: '40px',
        padding: '0px',
        margin: '5px',
    }
});

class GVMedicalOverlay extends React.Component {
    // we will set up these fields in constructor
    surface = null;
    chart = null;
    brush = null;
    eraser = null;
    brush_or_eraser = null;
    contrast = null;
    gvc = null;

    ids = {
        zoom_in_button_id: "zoom_in_button_id_",
        zoom_reset_button_id: "zoom_reset_button_id_",
        full_screen_button_id: "full_screen_button_id_",
        restore_screen_button_id: "restore_screen_button_id_",
        mask_layers_editor_id: "mask_layers_editor_id_",
        show_chart_button_id: "show_chart_button_id_",
        copy_chart_to_other_slices_button_id: "copy_chart_to_other_slices_button_id_",
        chart_editor_id: "chart_editor_id_",
        chart_canvas_id: "chart_canvas_id_",
        brush_button_id: "brush_button_id_",
        eraser_button_id: "eraser_button_id_",
        canvas_createjs_id: "canvas_createjs_id_",
        input_text_slice_id: "input_text_slice_id_",
        hounsfield_indicator_button_id: "hounsfield_indicator_button_id_",
        hounsfield_indicator_canvas_id: "hounsfield_indicator_canvas_id_",
        contrast_mode_button_id: "contrast_mode_button_id_",
    };

    supported_phases = ["Non Contrast", "Arterial", "Venous", "Delay"];

    state = {
        idx: "1",
    }
    
    chart_js_obj = null;

    
    is_rendered_chart = false;
    width_chart = 0;
    height_chart = 0;

    last_action = "";
    last_labeling_mask = null;

    chart_js_obj = null;

    constructor(props) {
        super(props);

        for (var key in this.ids) {
            this.ids[key] += props.canvas_id;
        }        
        
        this.surface = new MedicalSurfaceBox(this, this.ids.canvas_createjs_id);
        /////this.medical_chart_box = new MedicalChartBox(this);
        this.brush = new MedicalBrushBox(this, this.ids.brush_button_id);
        
        const is_eraser = true;
        this.eraser = new MedicalBrushBox(this, this.ids.eraser_button_id, is_eraser);
        this.contrast = new MedicalContrastModeBox(this, this.ids.contrast_mode_button_id);
        this.mask_editor = new MedicalMaskEditorBox(this, this.ids.mask_layers_editor_id);
        
        this.hounsfield_indicator = new MedicalHounsfieldIndicatorBox(this, 
            this.ids.hounsfield_indicator_button_id, 
            this.ids.hounsfield_indicator_canvas_id);

        this.gvc = props.gvc;
        this.gvc.set_medical_overlay(this);
    }
    
    _check_is_active = (dom_id) => {
        return document.getElementById(dom_id).getElementsByTagName("svg")[0].style.color == "rgba(255, 255, 0, 0.867)";
    }

    _set_active = (dom_id, is_active) => {
        if (is_active) {
            document.getElementById(this.brush_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd"; // yellow
        } else {
            document.getElementById(this.brush_button_id).getElementsByTagName("svg")[0].style.color = "#ffffffdd"; // white
        }
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

    label_selected = () => {
        this.surface.label_selected();
    }    

    _disable_conflict_features = (feature_name) => {
        if (feature_name != "brush_or_eraser") {
            // close brush or eraser
            if (this.brush_or_eraser) {
                this.brush_or_eraser.stop_labeling();
            }
        }

        if (feature_name != "hounsfield_indicator") {
            this.hounsfield_indicator.set_active(false);
        }

        if (feature_name != "zoom_in") {
            this.surface.deactivate_zoom_in();
        }

        if (feature_name != "chart") {
            // close chart
            if (this._check_is_active(this.ids.show_chart_button_id)) {
                this.show_or_close_chart(); // close the open chart
            }
        }

        if (feature_name == "chart" || feature_name == "hounsfield_indicator") {
            // do nothing
        } else {
            this.hounsfield_indicator.clean();
        }

        if (feature_name == "chart") {
            this.contrast.set_active(false);
        }
    }

    show_or_close_chart = () => {        
        if (document.getElementById(this.ids.show_chart_button_id).getElementsByTagName("svg")[0].style.color != "rgba(255, 255, 0, 0.867)") {
            this._disable_conflict_features("chart");

            // show chart
            document.getElementById(this.ids.show_chart_button_id).getElementsByTagName("svg")[0].style.color = "#ffff00dd";
            document.getElementById(this.ids.chart_editor_id).style.display = "block";

            this.init_chart_if_not_rendered();
        } else {
            // close chart
            document.getElementById(this.ids.show_chart_button_id).getElementsByTagName("svg")[0].style.color = "#ffffffdd";
            document.getElementById(this.ids.chart_editor_id).style.display = "none";
        }        
    }

    init_chart_if_not_rendered = () => {
        if (!this.is_rendered_chart) {
            var ctx = document.getElementById(this.ids.chart_canvas_id).getContext('2d');
            const medical_images = this.gvc.medical_images;
            const state = this.gvc.state;
            const cornerstone_image = medical_images[state.active_idx].cornerstone_image;
            const min_hounsfield = cornerstone_image.minPixelValue*cornerstone_image.slope + cornerstone_image.intercept;
            const max_hounsfield = cornerstone_image.maxPixelValue*cornerstone_image.slope + cornerstone_image.intercept;

            MedicalChartBox.chart_js_config.data.datasets[1].data[0].x = min_hounsfield;
            MedicalChartBox.chart_js_config.data.datasets[1].data[1].x = max_hounsfield;
            MedicalChartBox.chart_js_config.data.datasets[0].data[0].x = min_hounsfield;
            MedicalChartBox.chart_js_config.data.datasets[0].data[1].x = max_hounsfield;

            MedicalChartBox.chart_js_config.options.scales.xAxes[0].ticks.min = min_hounsfield;
            MedicalChartBox.chart_js_config.options.scales.xAxes[0].ticks.max = max_hounsfield;
            MedicalChartBox.chart_js_config.options.scales.xAxes[0].ticks.stepSize = Math.floor(max_hounsfield/5);

            this.chart_js_obj = new Chart(ctx, MedicalChartBox.chart_js_config);
            this.is_rendered_chart = true;
            this.chart_data.x_range = Math.abs(max_hounsfield - min_hounsfield);
            this.chart_data.min_hounsfield = min_hounsfield;
            this.chart_data.max_hounsfield = max_hounsfield;
        } else {
            // do nothing!
        }
    }

    copy_chart_to_other_slices = () => {
        this.gvc.sync_copy_to_slice();
    }

    copy_chart_to_one_slice = (phase_name) => {
        this.gvc.sync_copy_to_slice(phase_name[0]);
    }

    set_chart_for_contrast = (xmin, ymin, xmax, ymax) => {
        MedicalChartBox.set_chart_for_contrast(this, xmin, ymin, xmax, ymax);
    }

    set_chart_for_default = () => {
        MedicalChartBox.set_chart_for_default(this);
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
    
    componentDidMount() {
        // do nothing
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (this.chart_js_obj) {
            document.getElementById(this.ids.chart_canvas_id).style.width = this.width_chart+"px";
            document.getElementById(this.ids.chart_canvas_id).style.height = this.height_chart+"px";
        }
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

    _clear_mask_layer = () => {
        var mask_canvas = document.getElementById(this.props.canvas_id);
        mask_canvas.getContext('2d').clearRect(0, 0, mask_canvas.width, mask_canvas.height);
    }

    draw_mask = () => {
        this.hounsfield_indicator.render();

        var overlay_canvas = document.getElementById(this.props.canvas_id);
        var context = overlay_canvas.getContext("2d");
        context.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);

        this.mask_editor.clean();
        
        const medical_images = this.gvc.medical_images;
        const state = this.gvc.state;
        const vis_meta = this.gvc.vis_meta;
        const label_id = this.props.medical_label_state.getLabelId();

        if (medical_images[state.active_idx].labeling_mask == null) {
            return;
        }

        this.mask_editor.render(label_id);

        var mstate = this.props.medical_label_state;
        this.props.medical_label_state.all_labels.map(function(lb, key) {
            if (lb.id != label_id && label_id>=0) {
                return;
            }

            const lb_id = lb.id;

            if (medical_images[state.active_idx].labeling_mask==null || !(lb_id in medical_images[state.active_idx].labeling_mask)) {
                return;
            }

            var cvmask = medical_images[state.active_idx].labeling_mask[lb_id].clone();

            // check boundary mode
            const is_boundary_mode = mstate.is_boundary_mode;
            if (is_boundary_mode) {
                let M = cv.Mat.ones(5, 5, cv.CV_8U);
                let anchor = new cv.Point(-1, -1);
                // https://docs.opencv.org/3.0-beta/modules/imgproc/doc/filtering.html#morphologyex
                // Morphological Gradient
                // https://docs.opencv.org/3.0-beta/doc/py_tutorials/py_imgproc/py_morphological_ops/py_morphological_ops.html
                cv.morphologyEx(cvmask, cvmask, cv.MORPH_GRADIENT, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            }

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
            var debug_counter = 0;
            for(var p=0; p<cvmask.rows*cvmask.cols; p++) {
                if (cvmask.data[p] > 0) {
                    debug_counter+=1;
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

    render() {
        const { classes, width, height, canvas_id } = this.props;
        const total_images = this.gvc.medical_images.length;
        const self = this;

        var chart_scale = (this.gvc.state.total_items>1)?0.5:0.25;

        this.width_chart = Math.floor(width * chart_scale);
        this.height_chart = Math.floor(height * chart_scale);

        if (this.width_chart > this.height_chart) {
            this.width_chart = Math.floor(this.height_chart * 1.5);
        } else {
            this.height_chart = Math.floor(this.width_chart * 1.5);
        }

        //console.log("medical-overlay > render()");

        return (
            <div>
                <canvas className={classes.createjs_canvas} 
                    id={canvas_id}
                    width={width+"px"} 
                    height={height+"px"}></canvas>

                <canvas className={classes.createjs_canvas} 
                    id={this.ids.hounsfield_indicator_canvas_id}
                    width={width+"px"} 
                    height={height+"px"}></canvas>

                <canvas className={classes.createjs_canvas} 
                    id={this.ids.canvas_createjs_id}
                    width={width+"px"} 
                    height={height+"px"} 
                    onMouseMove={this.surface.mouse_move}
                    onMouseUp={this.surface.mouse_up}
                    onMouseDown={this.surface.mouse_down}
                    onContextMenu={this.surface.handle_click}
                    onWheel={this.surface.on_wheel}></canvas>
                <div style={{position: "absolute", left: "0px", top: "0px", zIndex: "100", margin: "0.5em"}}>
                    <div style={{marginBottom: "0.5em", textAlign: "left"}}>
                        <span className={classes.pos_text_info}>{this.props.phase_name}</span>
                    </div>

                    <div style={{marginBottom: "0.5em", textAlign: "center"}}>
                        <span className={classes.pos_text_info}>
                        <input type="text" id={this.ids.input_text_slice_id} 
                            value={this.state.idx} 
                            onChange={event => {this.setState({idx: event.target.value})}} 
                            onKeyPress={this.surface.go_to_slice}
                            style={{
                                width: "36px",
                            }}/></span><span className={classes.pos_text_info}> / {total_images}</span>
                    </div>

                    <IconButton onClick={this.surface.activate_zoom_in} 
                        id={this.ids.zoom_in_button_id} 
                        className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Zoom In" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <ZoomIn className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>

                    <IconButton 
                        onClick={this.surface.reset_zoom} 
                        id={this.ids.zoom_reset_button_id} 
                        className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Zoom Out" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <ZoomOut className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>

                    <IconButton 
                        onClick={this.show_or_close_chart} 
                        id={this.ids.show_chart_button_id} 
                        className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Show Chart" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <ShowChart className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>

                    <IconButton 
                        onClick={this.contrast.switch_mode} 
                        id={this.ids.contrast_mode_button_id} 
                        className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Contrast Mode" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Exposure className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>

                    <IconButton 
                        onClick={this.hounsfield_indicator.handle_click_hounsfield_indicator} 
                        id={this.ids.hounsfield_indicator_button_id} 
                        className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Hounsfield Statistic | Turn this off and click on region to delete" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Colorize className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>
                    
                    <IconButton 
                        onClick={this.brush.start_labeling} 
                        id={this.ids.brush_button_id} 
                        className={classes.icon_button}
                        style={{display: "none"}}>
                        <Tooltip title="Labeling by brush" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Brush className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>

                    <IconButton 
                        onClick={this.eraser.start_labeling} 
                        id={this.ids.eraser_button_id} 
                        className={classes.icon_button}
                        style={{display: "none"}}>
                        <Tooltip title="Eraser" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <RadioButtonUnchecked className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>
                </div>
                
                <div style={{position: "absolute", right: "0px", bottom: "0px", zIndex: "100", margin: "0.5em"}}>
                    <IconButton 
                        onClick={this.surface.full_screen} 
                        id={this.ids.full_screen_button_id} 
                        className={classes.icon_button}
                        style={{display: "block"}}>
                        <Tooltip title="Fullscreen" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <Fullscreen className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>
                    <IconButton 
                        onClick={this.surface.restore_screen} 
                        id={this.ids.restore_screen_button_id}
                        className={classes.icon_button}
                        style={{display: "none"}}>
                        <Tooltip title="Exit Fullscreen" placement="right" classes={{tooltip: classes.lightTooltip}}>
                            <FullscreenExit className={classes.icon} fontSize="large"/>
                        </Tooltip>
                    </IconButton>
                </div>

                <div id={this.ids.mask_layers_editor_id} 
                    style={{position: "absolute", 
                        right: "0px", 
                        top: "0px", 
                        zIndex: "100", 
                        margin: "0.5em",
                        maxHeight: "100%",
                        overflow: "auto"}}
                    className={classes.pos_text_info}>
                </div>

                <div id={this.ids.chart_editor_id} 
                    style={{position: "absolute", 
                    left: "8%", 
                    top: "0px", 
                    zIndex: "100", 
                    margin: "0.5em",
                    maxHeight: "100%",
                    overflow: "auto",
                    display: "none"}}
                    className={classes.pos_text_info}>
                    <canvas id={this.ids.chart_canvas_id}
                        width={this.width_chart+"px"} 
                        height={this.height_chart+"px"}
                        onMouseMove={this.chart_canvas_mouse_move}
                        onMouseUp={this.chart_canvas_mouse_up}
                        onMouseDown={this.chart_canvas_mouse_down}/>
                    <div>         
                        <span>
                            <Button variant="contained" color="secondary" 
                                className={classes.button_preset_chart} 
                                onClick={this.set_chart_for_default}>Default</Button>
                        </span>               
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