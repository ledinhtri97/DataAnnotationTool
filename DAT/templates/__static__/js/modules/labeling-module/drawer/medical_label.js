import {createItemToList} from "../controller/label"
import {Color} from "../style/color"
import {fabric} from "fabric";
import {drawStatus} from "../../../labeling";

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

	constructor(props) {
        // do nothing?!
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

    notify_label_selected = () => {
        for (var key in this.label_selected_callback){
            const cfunc = this.label_selected_callback[key];
            cfunc();
        }
    }

    notify_next_slice = () => {
        for (var key in this.next_slice_callback){
            const cfunc = this.next_slice_callback[key];
            cfunc();
        }
    }

    notify_prev_slice = () => {
        for (var key in this.prev_slice_callback){
            const cfunc = this.prev_slice_callback[key];
            cfunc();
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
