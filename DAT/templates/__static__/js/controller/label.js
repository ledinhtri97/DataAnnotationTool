import React from "react";
import ReactDOM from "react-dom";
import {fabric} from "fabric";
import {drawRect, drawPoly} from "../maintask";
import {createItemToBoundingBoxes, ElementITEM} from "./itemReact";
import {configureCircle, configurePoly} from "../drawer/polygon";
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

class LabelControl{

	constructor(__canvas__, __obj__){
		const lbc = this;
		lbc.canvas = __canvas__;
		lbc.obj = __obj__;
	}

	__overITEM__(){
		var iitem = this.canvas.getObjects().indexOf(this.obj);
		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[1].firstElementChild;

		if (icheckbox.checked) {
			this.canvas.item(iitem).visible = icheckbox.checked;
			// __canvas__.item(iitem).strokeWidth=3;
		}
		
		this.obj.setColor('rgba(0,255,0,0.2)');
		this.canvas.renderAll();

	}

	__outITEM__(){
		var iitem = this.canvas.getObjects().indexOf(this.obj);
		var __canvas__ = this.canvas;

		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[1].firstElementChild;

		if (icheckbox.checked) {
			__canvas__.item(iitem).visible = !icheckbox.checked;
			// __canvas__.item(iitem).strokeWidth=0;
		}
		
		this.obj.setColor('transparent');
		__canvas__.renderAll();
	}

	__hiddenITEM__(){
		var iitem = this.canvas.getObjects().indexOf(this.obj);

		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[1].firstElementChild;

		var bbs_available = document.getElementById("bbs_available");
		var bbs_hidden = document.getElementById("bbs_hidden");

		var icheckbox_edit = current_element.firstElementChild.children[2].firstElementChild;
		
		if (icheckbox.checked){
			icheckbox_edit.disabled = true;
			bbs_available.removeChild(current_element);
			bbs_hidden.appendChild(current_element);
		}
		else{
			icheckbox_edit.disabled = false;
			bbs_hidden.removeChild(current_element);
			createItemToBoundingBoxes(
				this.canvas,
				current_element.firstElementChild.firstElementChild.textContent,
				iitem);
		}
		this.obj.setColor('transparent');
		this.obj.visible = !icheckbox.checked;

		icheckbox_edit.checked = false;
		var wrapper = shallow(<ElementITEM canvas={this.canvas} objshape={this.obj}/>);
		wrapper.find(
			'input[type="checkbox"]'
			).at(1).simulate('change',{ target: { checked: icheckbox_edit.checked } });

		this.canvas.renderAll();

	}

	__eventedITEM__(){
		var iitem = this.canvas.getObjects().indexOf(this.obj);
		var __canvas__ = this.canvas;
		var lbc = this;

		var current_element = document.getElementById("itembb_"+iitem);
		var label = current_element.firstElementChild.firstElementChild.textContent;
		var icheckbox = current_element.firstElementChild.children[2].firstElementChild;

		this.obj.selectable = icheckbox.checked;
		__canvas__.discardActiveObject();
		

		if (this.obj.type == 'polygon'){
			this.obj.selectable = false;
			if(icheckbox.checked){

				lbc.obj.points.forEach(function(point, index) {
					var circle = configureCircle(point.x, point.y, index+"_"+iitem);
					
					circle.on('moving', function(){

						var p = circle;
						var __index__ = parseInt(p.name.split('_')[0]);

						lbc.obj.points[__index__] = {x: p.getCenterPoint().x, y: p.getCenterPoint().y};

						__canvas__.remove(lbc.obj);
						lbc.obj = configurePoly(lbc.obj.points);

						__canvas__.insertAt(lbc.obj, iitem);
						// __canvas__.sendToBack(lbc.obj);
						
						__canvas__.renderAll();
					});
					circle.on('moved', function(){

						__canvas__.remove(lbc.obj);

						lbc.obj = configurePoly(lbc.obj.points);

						__canvas__.insertAt(lbc.obj, iitem);
						__canvas__.renderAll();

						createItemToBoundingBoxes(__canvas__, label, iitem);

						var current_element = document.getElementById("itembb_"+iitem);
						var icheckbox = current_element.firstElementChild.children[2].firstElementChild;
						icheckbox.checked = true;

					});
					
					__canvas__.add(circle);
				});
			}
			else{
				__canvas__.getObjects().forEach(function(obj){
					if(obj.type=='circle'){
						var spl = obj.name.split('_');
						if(iitem == spl[1]){
							__canvas__.remove(obj);
						}
					}
				});
			}
		}

		__canvas__.renderAll();
		drawRect.endDraw();
		drawPoly.endDraw();
	}

	__deleteITEM__(){
		var iitem = this.canvas.getObjects().indexOf(this.obj);
		var __canvas__ = this.canvas;

		var map_obj = {};
		var f_circles = [];

		__canvas__.getObjects().forEach(function(obj, index){
			if(obj.type=='circle'){
				f_circles.push(obj);
				__canvas__.remove(obj);
			}
			else{
				if(index != iitem){
					map_obj[index] = obj;
				}
			}
		});

		var current_element = document.getElementById("itembb_"+iitem);
		__canvas__.remove(__canvas__.item(iitem))
		__canvas__.renderAll();
		current_element.parentElement.removeChild(current_element);

		for(var i in map_obj){
			var xxx = document.getElementById("itembb_"+i);
			var renewiitem = __canvas__.getObjects().indexOf(map_obj[i]);
			xxx.id = "itembb_"+renewiitem;

			var s_circles = [];

			for(var c of f_circles){
				var spl = c.name.split('_');
				if (spl[1] == i){
					c.name = spl[0]+'_'+renewiitem;
					s_circles.push(c);	
				}
			}

			for(var c of s_circles){
				f_circles.splice(f_circles.indexOf(c), 1)
				__canvas__.add(c);
			}
		}
		__canvas__.renderAll();
	}
}

export {LabelControl};
