class MedicalContrastModeBox {
    overlay = null;
    contrast_mode_button_id = "";

    _name = "contrast_mode";
    _color_hex_active = "#ffff00dd";
    _color_hex_default = "#ffffffdd";
    _color_rgba_active = "rgba(255, 255, 0, 0.867)"; // compatible to "_color_hex_active"

    constructor(overlay, contrast_mode_button_id) {
        this.overlay = overlay;
        this.contrast_mode_button_id = contrast_mode_button_id;
    }

    switch_mode = () => {
        this.set_active(!this.is_active());
    }

    is_active = () => {
        return document.getElementById(this.contrast_mode_button_id).getElementsByTagName("svg")[0].style.color == this._color_rgba_active;
    }

    set_active = (is_active) => {
        if (is_active) {
            this.overlay._disable_conflict_features(this._name);
            document.getElementById(this.contrast_mode_button_id).getElementsByTagName("svg")[0].style.color = this._color_hex_active;
        } else {
            document.getElementById(this.contrast_mode_button_id).getElementsByTagName("svg")[0].style.color = this._color_hex_default;
        }
    }
}

export default MedicalContrastModeBox