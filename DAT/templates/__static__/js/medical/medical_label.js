const MIN = 99;
const MAX = 999999;

class MedicalLabelState {
    typeLabel = "";
    labelId = 1;
    tagLabel = "";
    color = "#FFFF00";

    all_labels = null;
    label_selected_callback = {};
    next_slice_callback = {};
    prev_slice_callback = {};
    go_to_slice_callback = {};
    copy_chart_to_slice_callback = {};
    medical_gvcornerstone = {};

    is_boundary_mode = false;
    boundary_mode_callback = {};

	constructor(props) {
        // do nothing?!
    }
    
    switch_boundary_mode = () => {
        this.is_boundary_mode = !this.is_boundary_mode;
        for (var key in this.boundary_mode_callback) {
            const cfunc = this.boundary_mode_callback[key];
            cfunc();
        }
    }

    register_boundary_mode_callback = (key, myfunc) => {
        this.boundary_mode_callback[key] = myfunc;
    }

    register_medical_gvcornerstone = (key, medical_gvcornerstone_obj) => {
        this.medical_gvcornerstone[key] = medical_gvcornerstone_obj;
    }

    register_label_selected_callback = (key, myfunc) => {
        this.label_selected_callback[key] = myfunc;
    }

    register_next_slice_callback = (key, myfunc) => {
        this.next_slice_callback[key] = myfunc;
    }

    register_prev_slice_callback = (key, myfunc) => {
        this.prev_slice_callback[key] = myfunc;
    }

    register_go_to_slice_callback = (key, myfunc) => {
        this.go_to_slice_callback[key] = myfunc;
    }

    register_copy_chart_to_slice_callback = (key, myfunc) => {
        this.copy_chart_to_slice_callback[key] = myfunc;
    }

    notify_label_selected = () => {
        for (var key in this.label_selected_callback) {
            const cfunc = this.label_selected_callback[key];
            cfunc();
        }
    }

    notify_next_slice = () => {
        for (var key in this.next_slice_callback) {
            const cfunc = this.next_slice_callback[key];
            cfunc();
        }
    }

    notify_prev_slice = () => {
        for (var key in this.prev_slice_callback) {
            const cfunc = this.prev_slice_callback[key];
            cfunc();
        }
    }

    notify_go_to_slice = (active_idx) => {
        for (var key in this.go_to_slice_callback) {
            const cfunc = this.go_to_slice_callback[key];
            cfunc(active_idx);
        }
    }

    notify_copy_chart_to_slice = (except_key, lookup_table, control_points, xmin, xmax, ymin, ymax, destination_phase_first_char) => {
        for (var key in this.copy_chart_to_slice_callback) {
            if (destination_phase_first_char == undefined && key == except_key) {
                continue;
            } else if (destination_phase_first_char != undefined && this.medical_gvcornerstone[key].props.phase_name[0] != destination_phase_first_char) {
                continue;
            }
            const cfunc = this.copy_chart_to_slice_callback[key];
            cfunc(lookup_table, control_points, xmin, xmax, ymin, ymax);
            this.medical_gvcornerstone[key].update_chartjs_UI(control_points, xmin, xmax, ymin, ymax);
        }
    }

    setAllLabels(value) {
        this.all_labels = value;
    }

	setType(value){
		this.typeLabel = value;
    }
    
    setLabelId(value) {
        this.labelId = value;
    }

    setTagLabel(value) {
        this.tagLabel = value;
    }

    setColor(value) {
        this.color = value;
    }

	getType() {
		return this.typeLabel;
    }
    
    getLabelId() {
        return this.labelId;
    }

    getTagLabel() {
        return this.tagLabel;
    }

    getColor() {
        return this.color;
    }

}

export {MedicalLabelState};
