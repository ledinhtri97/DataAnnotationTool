import React from "react";
import ReactDOM from "react-dom";
import LabelItem from "../materialui/item";
import uniqid from "uniqid";
import {fabric} from "fabric";
import {drawPoly, listPredict, quickSettings} from "../main_module";
import {configureCircle, configurePoly} from "../drawer/polygon";
import {Color} from "../style/color"

class LabelControl{

	constructor(__canvas__, __obj__, __id__){
		const lbc = this;
		lbc.canvas = __canvas__;
		lbc.obj = __obj__;
		lbc.id =  __id__;
		lbc.edit = false;
	}

	circlesHandle(){

		this.canvas.remove(this.obj);

		this.obj = configurePoly(this.obj.points, this.obj.name, '1.0', this.obj.circles);

		this.obj.set('stroke', Color.RED)

		this.canvas.add(this.obj);

		this.canvas.renderAll();
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
			this.obj.visible = !checkbox_hidden.checked;
			this.obj.hidden = checkbox_hidden.checked;
			if(checkbox_hidden.checked) {
				this.__editITEM__(false); 
				this.canvas.add(this.obj.icon)
			}
			else{
				this.canvas.remove(this.obj.icon);	
			} 
			this.canvas.renderAll();
		}
	}

	__editITEM__(__default__=true){
		var __canvas__ = this.canvas;
		var lbc = this;
		var current_element = document.getElementById(this.id);

		lbc.edit = __default__ ? !lbc.edit : __default__;
		
		if(current_element){
			this.obj.selectable = lbc.edit;
			if (lbc.edit) {
				if(this.obj.type == 'rect'){
					this.obj.set('stroke', Color.RED);
					__canvas__.setActiveObject(this.obj);
				}
				drawPoly.endDraw();
			}
			else{
				var isPredictObj = listPredict.indexOf(this.obj);
				if (isPredictObj >= 0) {
					lbc.obj.set('stroke', Color.BLUE);
				}
				else{
					lbc.obj.set('stroke', lbc.obj.basicColor);
				}
				__canvas__.discardActiveObject();

			}		

			if (this.obj.type == 'polygon'){
				this.obj.selectable = false;
				if(lbc.edit){

					lbc.obj.set('stroke', Color.RED);

					lbc.obj.points.forEach(function(point, index) {

						var circle = configureCircle(point.x, point.y, index);

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
					var isPredictObj = listPredict.indexOf(this.obj);
					if (isPredictObj >= 0) {
						lbc.obj.set('stroke', Color.BLUE);
					}
					else{
						lbc.obj.set('stroke', lbc.obj.basicColor);
					}

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
		var lbc = this;
		var current_element = document.getElementById(this.id);
		if(current_element){

			//check enable predict
			var isPredictObj = listPredict.indexOf(this.obj);
			if (isPredictObj >= 0) {
				listPredict.splice(isPredictObj, 1);
				if(listPredict.length==0){
					document.getElementById("predict_api").style['display'] = '';
				}
			}

			//remove circle if avaliable in object poly
			if(lbc.obj.type == 'polygon'){
				lbc.obj.circles.forEach(function(c){
					lbc.canvas.remove(c);
				});
				lbc.obj.circles.splice(0, lbc.obj.circles.lenth);
			}

			this.canvas.remove(this.obj.icon);
			this.canvas.remove(this.obj);
			this.canvas.renderAll();
			current_element.parentElement.removeChild(current_element);
		}
	}

	getId(){
		return this.id;
	}

	getIsEdit(){
		return this.edit;
	}

	getNamelabel(){
		return this.obj.name;
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
