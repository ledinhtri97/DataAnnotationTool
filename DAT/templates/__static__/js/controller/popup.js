import React from "react";
import ReactDOM from "react-dom";
import {ElementITEM} from "./itemReact";
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

class PopupControllers{

	constructor(__canvas__){
		const PC = this;
		PC.canvas = __canvas__;

		var btn_delete = document.getElementById("btn_delete");
		var btn_hidden = document.getElementById("btn_hidden");
		var btn_edit = document.getElementById("btn_edit");

		PC.btn_hidden_event = function(e){
			document.getElementById("groupcontrol").style["display"] = "none";
			var iitem = PC.canvas.getObjects().indexOf(PC.objshape)
			var current_element = document.getElementById("itembb_"+iitem);
			var icheckbox = current_element.firstElementChild.children[1].firstElementChild;
			icheckbox.checked = !icheckbox.checked;

			var wrapper = shallow(<ElementITEM canvas={PC.canvas} objshape={PC.objshape}/>); 
			wrapper.find(
				'input[type="checkbox"]'
				).at(0).simulate('change',{ target: { checked: icheckbox.checked } });
		}

		PC.btn_edit_event = function(e){
			document.getElementById("groupcontrol").style["display"] = "none";
			var iitem = PC.canvas.getObjects().indexOf(PC.objshape)
			var current_element = document.getElementById("itembb_"+iitem);
			var icheckbox = current_element.firstElementChild.children[2].firstElementChild;

			icheckbox.checked = !icheckbox.checked;
			var wrapper = shallow(<ElementITEM canvas={PC.canvas} objshape={PC.objshape}/>);
			wrapper.find(
				'input[type="checkbox"]'
				).at(1).simulate('change',{ target: { checked: icheckbox.checked } });
		}

		PC.btn_delete_event = function(e){
			var wrapper = shallow(<ElementITEM canvas={PC.canvas} objshape={PC.objshape} />);
			wrapper.find('input[type="button"]').simulate('click');
			document.getElementById("groupcontrol").style["display"] = "none";
		}

		btn_delete.addEventListener('click', PC.btn_delete_event);
		btn_hidden.addEventListener('click', PC.btn_hidden_event);
		btn_edit.addEventListener('click', PC.btn_edit_event);
	}

	popup = function(__obj__){
		this.objshape = __obj__;

		var groupcontrol =  document.getElementById("groupcontrol");
		var tabletask = document.getElementById("tabletask");
		var cv_element = document.getElementById("canvas");
		document.getElementById("labelpopup").textContent = this.objshape.name;
		var left = (tabletask.clientWidth - cv_element.clientWidth) / 2;
		var top = (tabletask.clientHeight - cv_element.clientHeight) / 2;
		groupcontrol.style["left"] = (left + this.objshape.oCoords.tl.x) +"px";
		groupcontrol.style["top"] = (top + this.objshape.oCoords.tl.y - 40)+"px";
		groupcontrol.style["display"] = "";
	}
}

export {PopupControllers};