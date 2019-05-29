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

	constructor() {
        // do nothing?!
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
