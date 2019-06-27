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
}

export default MedicalBrushBox