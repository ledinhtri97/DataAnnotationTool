import React from "react";
import ReactDOM from "react-dom";
import LabelItem from "../../../materialui/labeling-ui/item";
import uniqid from "uniqid";
import {fabric} from "fabric";
import {drawTool, quickSettings, drawStatus} from "../../../labeling";
import {configureCircle, configurePoly} from "../drawtool";
import {Color} from "../style/color"
import AlertDialog from "../../../materialui/dialog";

const alertWarning = () => {
	var dialog = document.getElementById('dialog');

	if(dialog && quickSettings.getAtt('ask_dialog')){
		ReactDOM.unmountComponentAtNode(dialog);
		var message = "This shape is blocked! you can not edit this shape!, let's flag (F keyboard) to mark if this is false predict. (square shape means: right predict, circle shape means: false predict)";
		var request = "warning_label";
		ReactDOM.render(<AlertDialog message={message} request={request}/>, dialog);
	}
}

class LabelControl{

	constructor(__canvas__, __obj__, __id__){
		const lbc = this;
		lbc.canvas = __canvas__;
		lbc.obj = __obj__;
		lbc.id =  __id__;
		lbc.edit = false;
	}

	circlesHandle(){
		var idx = this.canvas.getObjects().indexOf(this.obj);

		this.canvas.remove(this.obj);

		var new_poly = configurePoly(this.obj.points, this.obj.name, '1.0', this.obj.circles);

		this.obj = new_poly;
		this.obj.labelControl = this;

		this.canvas.insertAt(this.obj, idx);

		this.canvas.renderAll();
	}

	__changeClass__(tag_label, type_label, color){
		if(this.obj.type_label == type_label){
			this.obj.set('name', tag_label);
			this.obj.set('stroke', color);
			this.obj.set('basicColor', color);
			this.obj.icon.set('fill', color);
			this.canvas.renderAll();

			drawStatus.setRenewLabel(false);
			drawStatus.setNameLabel(tag_label);
			drawStatus.setColorLabel(color);
			drawStatus.setIsChangingLabel(false);
			return true;
		}
		else{
			return false;
		}
	}

	__noClassChange__(){
		drawStatus.setIsChangingLabel(false);
	}

	__overITEM__(){
		var checkbox_hidden = document.getElementById(this.id+"_hidden");
		if(checkbox_hidden){
			if (checkbox_hidden.checked) {
				this.obj.visible = checkbox_hidden.checked;
			}
			this.obj.setColor(Color.Opacity_GREEN);
			this.canvas.renderAll();
		}
	}

	__outITEM__(){
		var checkbox_hidden = document.getElementById(this.id+"_hidden");
		if(checkbox_hidden){
			if (checkbox_hidden.checked) {
				this.obj.visible = !checkbox_hidden.checked;
			}
			this.obj.setColor(Color.Transparent);
			this.canvas.renderAll();
		}
	}

	__hiddenITEM__(){
		var checkbox_hidden = document.getElementById(this.id+"_hidden");
		if(checkbox_hidden){
			this.obj.setColor(Color.Transparent);
			this.obj.set('visible', !checkbox_hidden.checked);
			if(this.obj.shapeflag) {
				this.obj.shapeflag.set('visible', !checkbox_hidden.checked);
			}
			this.obj.set('hidden', checkbox_hidden.checked);
			if(checkbox_hidden.checked) {
				this.__editITEM__(false); 
				this.canvas.add(this.obj.icon);
			}
			else{
				this.canvas.remove(this.obj.icon);	
			} 
			// this.canvas.renderAll();
		}
	}

	__editITEM__(__default__=true){
		if (this.obj.accept_edit == false && __default__) {
			alertWarning();
			return;
		}
		var __canvas__ = this.canvas;
		var lbc = this;
		var current_element = document.getElementById(this.id);

		if(__default__){
			lbc.edit = !lbc.edit;
			if(this.obj.hidden){
				var e_hidden = document.getElementById(this.id+"_hidden");
				e_hidden && e_hidden.click();
			}
		}
		else {
			lbc.edit = false;
		}

		if(current_element){
			this.obj.selectable = lbc.edit;

			if (lbc.edit) {
				if(this.obj.type == 'rect'){
					this.obj.set('stroke', Color.RED);
					__canvas__.setActiveObject(this.obj);
					setTimeout(function() { //auto set block edit after 10s
						lbc.obj.set('selectable', false);
						lbc.obj.set('edit', false);
						lbc.obj.set('stroke', lbc.obj.basicColor);
						__canvas__.renderAll();
					}, 10000);
				}
				drawTool.endDraw();
			}
			else{
				lbc.obj.set('stroke', lbc.obj.basicColor);
				__canvas__.discardActiveObject();
			}		

			if (this.obj.type == 'polygon'){
				this.obj.set('selectable', false);
				if(lbc.edit){
					if(lbc.obj.circles.length > 0){
						lbc.obj.circles.forEach(function(c){
							__canvas__.remove(c);
						});
						lbc.obj.circles.splice(0, lbc.obj.circles.lenth);
					}

					lbc.obj.points.forEach(function(point, index) {
						var circle = configureCircle(point.x, point.y, index);

						circle.set('isEditPolygonIcon', true);

						circle.on('moving', function(){
							var p = circle;
							var i = parseInt(p.name);
							lbc.obj.points[i] = {x: p.getCenterPoint().x, y: p.getCenterPoint().y};
							lbc.circlesHandle();
						});

						circle.on('moved', function(){
							lbc.circlesHandle();
						});

						lbc.obj.circles.push(circle);
						__canvas__.add(circle);
					});
				}
				else{
					lbc.obj.set('stroke', lbc.obj.basicColor);
					lbc.obj.circles.forEach(function(c){
						__canvas__.remove(c);
					});
					lbc.obj.circles.splice(0, lbc.obj.circles.lenth);
				}
			}
			__canvas__.renderAll();
		}
	}

	__deleteITEM__(){
		if (this.obj.accept_edit == false) {
			alertWarning();
			return;
		}
		var lbc = this;
		var current_element = document.getElementById(this.id);
		if(current_element){

			//remove circle if available in object poly
			if(lbc.obj.type == 'polygon'){
				lbc.obj.circles.forEach(function(c){
					lbc.canvas.remove(c);
				});
				lbc.obj.circles.splice(0, lbc.obj.circles.lenth);
			}
			this.canvas.remove(this.obj);
			this.canvas.remove(this.obj.icon);
			current_element.parentElement.removeChild(current_element);
		}
		else {
			console.log("noooooooooo delete" + this.id)
		}
	}

	getTypeLabel() {
		return this.obj.type_label;
	}

	getValueClass(){
		return this.obj.name+','+this.obj.type_label+','+this.obj.stroke;
	}

	getId(){
		return this.id;
	}

	getIsEdit(){
		return this.edit;
	}

	getNameLabel(){
		return this.obj.name;
	}

	getShortNamelabel(){
		return this.obj.name.length < 5 ? this.obj.name : this.obj.name.substring(0, 4)+'...';
	}
}

const createItemToList = function(canvas, object){
	var label_list_items = document.getElementById("label_list_items");
	var new_element =  document.createElement("div");
	new_element.id = uniqid();
	label_list_items.appendChild(new_element);
	object.labelControl = new LabelControl(canvas, object, new_element.id);
	ReactDOM.render(<LabelItem labelControl={object.labelControl}/>, new_element);

	if(quickSettings.getAtt('auto_hidden')){
		var e_hidden = document.getElementById(object.labelControl.getId()+"_hidden");
		e_hidden && e_hidden.click();
	}
}

export {LabelControl, createItemToList};
