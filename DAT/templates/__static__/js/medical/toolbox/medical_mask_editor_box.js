class MedicalMaskEditorBox {
    overlay = null;
    mask_layers_editor_id = "";
    _name = "mask_editor";

    constructor(overlay, mask_layers_editor_id) {
        this.overlay = overlay;
        this.mask_layers_editor_id = mask_layers_editor_id;
    }

    render = (label_id) => {
        const self = this;
        const labeling_mask_layers = this.overlay.gvc.labeling_mask_layers;
        const mask_layers = labeling_mask_layers[this.overlay.gvc.state.active_idx];        
        
        var dom_mask_items = [];
        for (var ml=0; ml<mask_layers.length; ml++) {
            const mask_info = mask_layers[ml];
            const mask_label_id = parseInt(mask_info.label_id);
            if (mask_label_id != label_id && label_id >= 0 || !('editable' in mask_info) || mask_info.editable == false) {
                // skip when:
                // + not in the current showing label
                // + mask_info has no "editable" field
                // + mask_info.editable is false
                continue;
            }

            var label_info = null;
            for (var al=0; al<this.overlay.props.medical_label_state.all_labels.length; al++) {
                if (this.overlay.props.medical_label_state.all_labels[al].id == mask_label_id) {
                    label_info = this.overlay.props.medical_label_state.all_labels[al];
                    break;
                }                
            }

            if (label_info != null) {
                const mask_label_tag_name = label_info.tag_label;

                const div_node = document.createElement("div");
                div_node.style.textAlign = "right";

                // add check icon
                var check_icon_node = document.createElement("span");
                check_icon_node.style.cursor = "pointer";
                check_icon_node.innerHTML = '<i class="fa fa-check-circle-o fa-2" aria-hidden="true"></i>&nbsp;&nbsp;';
                ///const line_idx = dom_mask_items.length;
                check_icon_node.addEventListener('click', function() {
                    mask_info.editable = false;
                    div_editor.removeChild(div_node);
                });
                div_node.appendChild(check_icon_node);

                // add label text
                var text_node = document.createTextNode(mask_label_tag_name);
                div_node.appendChild(text_node);
                
                const mask_idx = ml;

                // add track bar
                var track_bar_node = document.createElement("span");
                var delta_string = (mask_info.delta.toString().length==2)?mask_info.delta.toString():"&nbsp;&nbsp;"+mask_info.delta.toString();
                track_bar_node.innerHTML = '&nbsp;&nbsp;<input type="range" id="trackbar" value="' + mask_info.delta + '" min="1" max="50" step="1" width="30%"> <span name="intensity_threshold">' + delta_string + '</span>';
                track_bar_node.getElementsByTagName("input")[0].addEventListener('input', function() {
                    const value = this.value;
                    var value_str = (value.toString().length==2)?value.toString():"&nbsp;&nbsp;"+value.toString();
                    this.parentNode.getElementsByTagName("span")[0].innerHTML = value_str;
                });
                track_bar_node.getElementsByTagName("input")[0].addEventListener('change', function() {
                    self.overlay.gvc.region_growing(mask_info.x_percent, mask_info.y_percent, parseInt(this.value), mask_idx);
                    self.overlay.draw_mask();
                });

                if (mask_info.delta > 0) {
                    div_node.appendChild(track_bar_node);
                } else {
                    track_bar_node.getElementsByTagName("input")[0].disabled = true;
                    div_node.appendChild(track_bar_node);
                }               
                
                // add remove icon
                var remove_icon_node = document.createElement("span");
                remove_icon_node.style.cursor = "pointer";
                remove_icon_node.innerHTML = '&nbsp;&nbsp;<i class="fa fa-times-circle-o fa-2" aria-hidden="true"></i>';
                remove_icon_node.addEventListener('click', function() {
                    self.overlay.gvc.remove_labeling_mask_layers(mask_idx);
                });
                div_node.appendChild(remove_icon_node);

                dom_mask_items.push(div_node);
            }
        }

        const div_editor = document.getElementById(this.mask_layers_editor_id);
        for(var dmi=0; dmi<dom_mask_items.length; dmi++) {
            div_editor.appendChild(dom_mask_items[dmi]);
        }
    }

    clean = () => {
        const div_editor = document.getElementById(this.mask_layers_editor_id);
        while (div_editor.firstChild) {
            div_editor.removeChild(div_editor.firstChild);
        }
    }
}

export default MedicalMaskEditorBox