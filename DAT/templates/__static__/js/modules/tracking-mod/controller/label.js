import React from "react";
import ReactDOM from "react-dom";
import LabelItem from "../../../materialui/general-ui/item";
import uniqid from "uniqid";
import {fabric} from "fabric";
import {drawTool, quickSettings, drawStatus, popupControllers} from "../../../tracking";
import {configureCircle, configurePoly, configureLinePoly} from "../drawtool";
import Color from "../../general-mod/style/color"
import AlertDialog from "../../../materialui/dialog";

const ROUND = 100000;

const alertWarning = () => {
	var dialog = document.getElementById('dialog');

	if(dialog && quickSettings.getAtt('ask_dialog')){
		ReactDOM.unmountComponentAtNode(dialog);
		var message = "This shape is blocked! you can not edit this shape!, let's flag (F keyboard) to mark if this is false predict. (square shape means: right predict, circle shape means: false predict)";
		var request = "warning_label";
		ReactDOM.render(<AlertDialog message={message} request={request}/>, dialog);
	}
}

const cal_a = function(x1, y1, x2, y2){
	return (y2-y1)/(x2-x1);
}

const cal_b = function(x1, y1, x2, y2){
	return (x2*y1-x1*y2)/(x2-x1);
}

const cal_x = function(a1, b1, a2, b2){
	return (b2-b1)/(a1-a2);
}

const cal_y = function(a1, b1, a2, b2){
	return (a1*b2-a2*b1)/(a1-a2);
}

const cal_d = function(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2));
}

const check_way = function(A, B, C, D){
	let AB = [cal_a(A.x, A.y, B.x, B.y), cal_b(A.x, A.y, B.x, B.y)];
	let CD = [cal_a(C.x, C.y, D.x, D.y), cal_b(C.x, C.y, D.x, D.y)];
	//B above C, AB cut CD at E
	let xE = cal_x(AB[0], AB[1], CD[0], CD[1]);
	let yE = cal_y(AB[0], AB[1], CD[0], CD[1]);
	let dAB = cal_d(A.x, A.y, B.x, B.y);
	let dAE = cal_d(A.x, A.y, xE, yE);
	return dAB < dAE;
}

class LabelControl{

	constructor(__canvas__, __obj__, __id__){
		const lbc = this;
		lbc.canvas = __canvas__;
		lbc.obj = __obj__;
		lbc.id =  __id__;
		lbc.from_id = '';
		lbc.isLinkLabel = false;
		lbc.edit = false;
		lbc.isHidden = false;
		
		if(lbc.obj.type_label === 'poly'){
			lbc.pointArray = new Array();
			lbc.lineArray = new Array();

			lbc.mouseDown = function(o){
				if (!drawStatus.getZoomSpaceKey()) {
					let pointer = lbc.canvas.getPointer(o.e);
					let lastPointer = lbc.pointArray[lbc.pointArray.length - 1];
					let points = [lastPointer.x, lastPointer.y, pointer.x, pointer.y];
					let line = configureLinePoly(points);

					lbc.pointArray.push({x: pointer.x, y: pointer.y});
					lbc.lineArray.push(line);
					
					lbc.canvas.add(line);
				}
			};
		}
	}

	cleanPolygonStuff(clean_circles=true){
		let lbc = this;
		lbc.lineArray.forEach(function(line){
			lbc.canvas.remove(line);
		});
		lbc.obj.set('start_index', -1);
		lbc.pointArray = new Array();
		lbc.lineArray = new Array();

		lbc.canvas.off('mouse:down', lbc.mouseDown);
		if (clean_circles){
			lbc.obj.circles.forEach(function(c){
				lbc.canvas.remove(c);
			});
			lbc.obj.circles = new Array();
		}
	}

	addPointPolygonHandle(end_index=-1){

		let idx = this.canvas.getObjects().indexOf(this.obj);
		let canvas = this.canvas;
		

		if(end_index!=-1){
			let s_i, e_i, right_side, left_side;
			let new_points = [];

			if(this.obj.start_index > end_index){
				s_i = end_index;
				e_i = this.obj.start_index;
			}
			else{
				s_i = this.obj.start_index;
				e_i = end_index;
			}

			right_side = e_i - s_i - 1;
			left_side = this.obj.points.length - 2 - right_side;

			let right_point_index = s_i + parseInt((right_side + 1) / 2);
			let left_point_index = e_i + parseInt(left_side / 2);
			if (left_point_index >= this.obj.points.length) {
				left_point_index -= this.obj.points.length;
			}

			let A = this.obj.points[s_i];
			let B = this.pointArray[1];
			let C = this.pointArray[this.pointArray.length - 2];
			let D = this.obj.points[e_i];
			let R = this.obj.points[right_point_index];
			let L = this.obj.points[left_point_index];

			let checkWay = check_way(A, B, C, D);
			let perimeter_right = cal_d(A.x, A.y, R.x, R.y) + cal_d(R.x, R.y, D.x, D.y);
			let perimeter_left = cal_d(A.x, A.y, L.x, L.y) + cal_d(L.x, L.y, D.x, D.y);


			if (perimeter_right >= perimeter_left){
				for (let i = s_i; i <= e_i; i++){
					new_points.push({x: this.obj.points[i].x, y: this.obj.points[i].y});
				}
				if(checkWay){
					for (let i = this.pointArray.length - 2; i > 0; i--){
						new_points.push(this.pointArray[i]);
					}	
				}
				else{
					for (let i = 1; i < this.pointArray.length - 1; i++){
						new_points.push(this.pointArray[i]);
					}
				}
			}
			else{
				for (let i = 0; i <= s_i; i++){
					new_points.push({x: this.obj.points[i].x, y: this.obj.points[i].y});
				}
				if(checkWay){
					for (let i = 1; i < this.pointArray.length - 1; i++){
						new_points.push(this.pointArray[i]);
					}	
				}
				else{
					for (let i = this.pointArray.length - 2; i > 0; i--){
						new_points.push(this.pointArray[i]);
					}
				}
				for (let i = e_i; i < this.obj.points.length; i++){
					new_points.push({x: this.obj.points[i].x, y: this.obj.points[i].y});
				}
			}

			let new_poly = configurePoly(new_points, this.obj.name, '1.0');
			new_poly.set('stroke', this.obj.stroke);
			new_poly.set('start_index', -1);
			
			this.canvas.remove(this.obj);
			this.cleanPolygonStuff();

			this.obj = new_poly;
			this.obj.labelControl = this;
			this.canvas.insertAt(this.obj, idx);

			this.edit = false;
			this.__editITEM__();
		}
	}

	circlesHandle(){
		let idx = this.canvas.getObjects().indexOf(this.obj);

		this.canvas.remove(this.obj);

		let new_poly = configurePoly(this.obj.points, this.obj.name, '1.0', this.obj.circles);

		new_poly.set('stroke', this.obj.stroke);
		this.obj = new_poly;
		this.obj.labelControl = this;
		this.canvas.insertAt(this.obj, idx);
	}

	__changeClass__(tag_label, type_label, color){
		if(this.obj.type_label == type_label){
			let pos_id = this.id.split('_')[0];
			let list_fObj = drawStatus.getObjectsLTM(pos_id);

			for (let pos in list_fObj) {
				
				if (!list_fObj[pos].canvas) continue;

				list_fObj[pos].set('name', tag_label);
				list_fObj[pos].set('stroke', color);
				list_fObj[pos].icon.set('fill', color);
				list_fObj[pos].canvas.renderAll();
			}

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
		drawStatus.setRenewLabel(false);
		drawStatus.setIsChangingLabel(false);
	}

	__overITEM__(){

		let lbc = this;

		if (!lbc.obj.canvas || lbc.isLinkLabel) return false;

		if (!lbc.obj.hidden) {
			lbc.obj.set('fill', Color.Opacity_RED);
			if(lbc.obj.type != 'polygon'){
				lbc.obj.set('selectable', lbc.getIsEdit());
			}
			else{
				lbc.obj.set('selectable', false);
			}
			popupControllers.popup(lbc.obj, lbc.canvas);
		}
		else{
			lbc.obj.set('visible', true);
			if(lbc.obj.shapeflag) {
				lbc.obj.shapeflag.set('visible', true);
			}
			popupControllers.popup(lbc.obj, lbc.canvas);
		}

		lbc.canvas.renderAll();

		return true;
	}

	__outITEM__(){
		let lbc = this;

		if (!lbc.obj.canvas || lbc.isLinkLabel) return false;
		if (!lbc.obj.hidden) {
			lbc.obj.set('fill', Color.Transparent);
		}
		else{
			lbc.obj.set('visible', false);
			if(lbc.obj.shapeflag) {
				lbc.obj.shapeflag.set('visible', false);
			}
		}
		let temGC = document.getElementById("group_control"+lbc.canvas.pos);
		if(temGC) {
			temGC.style["display"] = "none";
		}
		lbc.canvas.renderAll();

		return true;
	}

	__hiddenITEM__(){
		let lbc = this;
		lbc.isHidden = !lbc.isHidden;
		
		lbc.obj.set('visible', !lbc.isHidden);
		if(lbc.obj.shapeflag) {
			lbc.obj.shapeflag.set('visible', !lbc.isHidden);
		}
		lbc.obj.set('hidden', lbc.isHidden);

		if (lbc.isHidden) {
			lbc.__editITEM__(false); 
			lbc.canvas.add(lbc.obj.icon);
		}
		else {
			lbc.canvas.remove(lbc.obj.icon);
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
			lbc.obj.selectable = lbc.edit;

			if (lbc.edit) {
				if(lbc.obj.type == 'rect'){
					__canvas__.setActiveObject(lbc.obj);
				}
				if (!drawStatus.getIsWaiting()){
					drawTool.removeStuff();
				}
				drawTool.endDraw();
			}
			else{
				lbc.obj.set({
					xmin: Math.round(lbc.obj.left * ROUND / __canvas__.getWidth()) / ROUND,
					ymin: Math.round(lbc.obj.top * ROUND / __canvas__.getHeight()) / ROUND,
					xmax: Math.round((lbc.obj.left + lbc.obj.width) * ROUND / __canvas__.getWidth()) / ROUND,
					ymax: Math.round((lbc.obj.top + lbc.obj.height) * ROUND / __canvas__.getHeight()) / ROUND,
				});
				__canvas__.discardActiveObject();

				//auto hidden obj
				setTimeout(function(){
					if(lbc.obj.hidden){
						var e_hidden = document.getElementById(lbc.id+"_hidden");
						e_hidden && e_hidden.click();
					}
				}, 300);

			}		

			if (this.obj.type == 'polygon'){
				this.obj.set('selectable', false);
				if(lbc.edit){

					if(lbc.obj.circles.length > 0){
						lbc.obj.circles.forEach(function(c){
							__canvas__.remove(c);
						});
						lbc.obj.circles = new Array();
					}

					drawStatus.getActivePolygons()[lbc.id] = lbc.obj;

					lbc.obj.points.forEach(function(point, index) {
						var circle = configureCircle(point.x, point.y, index);
						
						circle.set('isEditPolygonIcon', true);

						circle.on('mousedown', function(){
							//TODO
							setTimeout(function(){
								let i = parseInt(circle.name);
								if(lbc.obj.start_index != -1){
									lbc.addPointPolygonHandle(i);
								}
								else{
									lbc.obj.set('start_index', i);
									lbc.pointArray.push({x: circle.getCenterPoint().x, y: circle.getCenterPoint().y});
									__canvas__.off('mouse:down', lbc.mouseDown);
									__canvas__.on('mouse:down', lbc.mouseDown);
								}
							}, 200);
						});

						circle.on('moving', function(){
							let i = parseInt(circle.name);
							lbc.obj.points[i] = {x: circle.getCenterPoint().x, y: circle.getCenterPoint().y};
							lbc.circlesHandle();
							if(lbc.obj.start_index != -1) {
								lbc.obj.set('start_index', -1);
							}
						});

						circle.on('moved', function(){
							if(lbc.obj.start_index == -1){
								lbc.cleanPolygonStuff(false);
							}
							lbc.circlesHandle();
							
						});

						lbc.obj.circles.push(circle);
						__canvas__.add(circle);
					});
				}
				else{
					lbc.cleanPolygonStuff();
					delete drawStatus.getActivePolygons()[lbc.id];

					let rpoints = [];
					for (var p of this.obj.points){
						rpoints.push({
							x: Math.round(p.x * ROUND / __canvas__.getWidth()) / ROUND,
							y: Math.round(p.y * ROUND / __canvas__.getHeight()) / ROUND
						});
					}
					this.obj.set('rpoints', rpoints);
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
		var current_element = document.getElementById(lbc.id);
		if(current_element){

			//remove circle if available in object poly
			if(lbc.obj.type == 'polygon'){
				lbc.cleanPolygonStuff();
			}
			lbc.canvas.remove(lbc.obj);
			lbc.canvas.remove(lbc.obj.icon);
			current_element.parentElement.removeChild(current_element);


			let spl_id = lbc.getId().split('_');
			let id = spl_id[0], pos = '_' + spl_id[1];
			//remove obj in LTM
			drawStatus.removeOneFromLTM(id, pos);

			//remove hover on objects in other canvas
			let list_fObj = drawStatus.getObjectsLTM(id);

			if (Object.keys(list_fObj).length == 0) {
				drawStatus.removeAllFromLTM(id);
			}
			else {
				for (let pos in list_fObj) {
					
					let temp_obj = list_fObj[pos];

					if (!temp_obj.canvas) continue;

					if (!temp_obj.hidden) {
						temp_obj.set('fill', Color.Transparent);
					}
					else{
						temp_obj.visible = false;
						if(temp_obj.shapeflag) {
							temp_obj.shapeflag.set('visible', false);
						}
						let temGC = document.getElementById("group_control"+lbc.canvas.pos);
						if(temGC) {
							temGC.style["display"] = "none";
						}
					}
					temp_obj.canvas.renderAll();
				}
			}
		}
		else {
			console.log("no delete " + lbc.id)
		}
	}

	__copyToLayer1__() {
		let lbc = this;
		if (lbc.canvas.pos == '_tl') return;
		drawTool.copyObject(lbc.obj, '_tl');
	}

	__copyToLayer2__() {
		let lbc = this;
		if (lbc.canvas.pos == '_tr') return;
		drawTool.copyObject(lbc.obj, '_tr');
	}

	__copyToLayer3__() {
		let lbc = this;
		if (lbc.canvas.pos == '_bl') return;
		drawTool.copyObject(lbc.obj, '_bl');
	}

	__copyToLayer4__() {
		let lbc = this;
		if (lbc.canvas.pos == '_br') return;
		drawTool.copyObject(lbc.obj, '_br');
	}

	__controlIsLinkLabel__() {
		let lbc = this;
		lbc.isLinkLabel = !lbc.isLinkLabel;
		if (lbc.isLinkLabel){
			lbc.obj.set('fill', Color.Opacity_YELLOW);
		}
		else {
			lbc.obj.set('fill', Color.Opacity_RED);
		}
		lbc.canvas.renderAll();
	}

	getIsLinkLabel() {
		return this.isLinkLabel;
	}

	getListLabel() {
		if(this.obj.type_label === 'rect'){
			return drawStatus.getListLabelRect();
		}
		else if (this.obj.type_label === 'poly'){
			return drawStatus.getListLabelPoly();
		}
		return null;
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

	setId(id) {
		document.getElementById(this.id).id = id;
		this.id = id;
	}

	getPosId(){
		return this.id.split('_')[0];
	}

	getFromId() {
		return this.from_id;
	}

	setFromId(v) {
		this.from_id = v;
	}

	getIsEdit(){
		return this.edit;
	}

	getNameLabel(){
		return this.obj.name;
	}

	getShortNamelabel(){
		return this.obj.name.length < 5 ? this.obj.name : this.obj.name.substring(0, 4)+'..';
	}
}

const createItemToList = function(canvas, object, id){
	var label_list_items = document.getElementById("label_list_items");
	var new_element =  document.createElement("div");
	let pos_id = uniqid();
	new_element.id = id ? id : pos_id+canvas.pos;
	label_list_items.appendChild(new_element);
	object.labelControl = new LabelControl(canvas, object, new_element.id);
	ReactDOM.render(<LabelItem labelControl={object.labelControl}/>, new_element);

	if(quickSettings.getAtt('auto_hidden')){
		var e_hidden = document.getElementById(object.labelControl.getId()+"_hidden");
		e_hidden && e_hidden.click();
	}
}

export {LabelControl, createItemToList};
