class MedicalBrushBox {
    overlay = null;
    brush_button_id = "";
    brush_radius = 5;

    constructor(overlay, brush_button_id) {
        this.overlay = overlay;
        this.brush_button_id = brush_button_id;
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

    start_labeling_by_brush = () => {
        console.log('Overlay > start_labeling_by_brush()');
        if (!this.is_active()) {
            // start labeling with brush ...
            if (this.overlay._check_is_active(this.overlay.ids.show_chart_button_id)) {
                this.overlay.show_or_close_chart(); // close the open chart
            }

            // change state
            this.set_active(true);
        } else {
            // stop labeling with brush ...
            // change state
            this.set_active(false);
            // clear canvas
            this.overlay.surface._clear_surface();
        }
    }
}

export default MedicalBrushBox