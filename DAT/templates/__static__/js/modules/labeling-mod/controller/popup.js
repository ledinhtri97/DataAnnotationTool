import React from "react";
import ReactDOM from "react-dom";
import {quickSettings, drawStatus} from '../../../labeling'

class PopupControllers{

	popup = function(__obj__){
		this.objshape = __obj__.isIcon ? __obj__.object : __obj__;

		var group_control = document.getElementById("group_control");
		var canPopup = !drawStatus.getIsDrawing() || (drawStatus.getIsWaiting() && drawStatus.getIsDrawing());
		if(quickSettings.getAtt('show_label') && group_control && canPopup && !drawStatus.getIsZoom()) {
			
			var cvcontainer = document.getElementById("cvcontainer");
			var cv_element = document.getElementById("canvas");
			document.getElementById("label_popup").textContent = this.objshape.name;
			// document.getElementById("accuracy_popup").textContent = "[ " + this.objshape.accuracy + " ]";
			var left = (cvcontainer.clientWidth - cv_element.clientWidth) / 2;
			var top = (cvcontainer.clientHeight - cv_element.clientHeight) / 2;
			group_control.style["left"] = (left + this.objshape.oCoords.tl.x) +"px";
			group_control.style["top"] = (top + this.objshape.oCoords.tl.y - 20)+"px";
			group_control.style["display"] = "";
		}
	}
}

export {PopupControllers};