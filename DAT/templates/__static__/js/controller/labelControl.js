import React from "react";
import ReactDOM from "react-dom";
import {fabric} from "fabric";
import {drawTool} from "../maintask.js";
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const AllCheckBoxEdit = function(canvas, value){
	var bbs_available = document.getElementById("bbs_available");
	Array.from(bbs_available.children).forEach(function(elem) {
		var icheckbox = elem.firstElementChild.children[2].firstElementChild;
		if(icheckbox.checked!=value){
			icheckbox.checked = value;
			var iitem = parseInt(elem.id.split('_')[1]);
			var wrapper = shallow(<ElementITEM canvas={canvas} rect={canvas.item(iitem)}/>);
			wrapper.find(
				'input[type="checkbox"]'
				).at(1).simulate('change',{ target: { checked: icheckbox.checked } });
		}
	});
}

const AllCheckBoxHidden = function(canvas, value){
	var type_get_all_checkbox = value? "bbs_available" : "bbs_hidden";
	var bbs_select = document.getElementById(type_get_all_checkbox);

	Array.from(bbs_select.children).forEach(function(elem) {
		var icheckbox = elem.firstElementChild.children[1].firstElementChild;
		icheckbox.checked = value;
		var iitem = parseInt(elem.id.split('_')[1]);
		var wrapper = shallow(<ElementITEM canvas={canvas} rect={canvas.item(iitem)}/>);
		wrapper.find(
			'input[type="checkbox"]'
			).at(0).simulate('change',{ target: { checked: icheckbox.checked } });
		
	});
}

function triggerSyntheticEvent(canvas, rect, index, value){
	var wrapper = shallow(<ElementITEM canvas={canvas} rect={rect} />); 
	var i = wrapper.find('input[type="checkbox"]');
	i.at(index).simulate('change',{ target: { checked: value } });
}

class PopupControllers{

	constructor(__canvas__){
		const PC = this;
		PC.canvas = __canvas__;

		var btn_delete = document.getElementById("btn_delete");
		var btn_hidden = document.getElementById("btn_hidden");
		var btn_edit = document.getElementById("btn_edit");

		PC.btn_hidden_event = function(e){
			var current_element = document.getElementById("itembb_"+PC.iitem);
			var icheckbox = current_element.firstElementChild.children[1].firstElementChild;
			icheckbox.checked = !icheckbox.checked;

			var wrapper = shallow(<ElementITEM canvas={PC.canvas} rect={PC.rect}/>); 
			wrapper.find(
				'input[type="checkbox"]'
				).at(0).simulate('change',{ target: { checked: icheckbox.checked } });
		}

		PC.btn_edit_event = function(e){
			var current_element = document.getElementById("itembb_"+PC.iitem);
			var icheckbox = current_element.firstElementChild.children[2].firstElementChild;

			icheckbox.checked = !icheckbox.checked;
			var wrapper = shallow(<ElementITEM canvas={PC.canvas} rect={PC.rect}/>);
			wrapper.find(
				'input[type="checkbox"]'
				).at(1).simulate('change',{ target: { checked: icheckbox.checked } });
		}

		PC.btn_delete_event = function(e){
			var wrapper = shallow(<ElementITEM canvas={PC.canvas} rect={PC.rect} />);
			wrapper.find('input[type="button"]').simulate('click');
			document.getElementById("groupcontrol").style["display"] = "none";
		}

		btn_delete.addEventListener('click', PC.btn_delete_event);
		btn_hidden.addEventListener('click', PC.btn_hidden_event);
		btn_edit.addEventListener('click', PC.btn_edit_event);
	}

	popup = function(__obj__, iitem){
		this.__obj__ = __obj__;
		this.iitem = iitem;
		this.rect = this.canvas.item(iitem);

		var groupcontrol =  document.getElementById("groupcontrol");
		var tabletask = document.getElementById("tabletask");
		var cv_element = document.getElementById("canvas");
		var left = (tabletask.clientWidth - cv_element.clientWidth) / 2;
		var top = (tabletask.clientHeight - cv_element.clientHeight) / 2;
		groupcontrol.style["left"] = (left + this.__obj__.oCoords.tl.x) +"px";
		groupcontrol.style["top"] = (top + this.__obj__.oCoords.tl.y - 20)+"px";
		groupcontrol.style["display"] = "";
	}
}


class LabelControl{

	__overITEM__(__canvas__, iitem){
		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[1].firstElementChild;

		if (icheckbox.checked) {
			__canvas__.item(iitem).visible = icheckbox.checked;
			// __canvas__.item(iitem).strokeWidth=3;
		}
		
		__canvas__.item(iitem).setColor('rgba(0,255,0,0.2)');
		__canvas__.renderAll();

	}

	__outITEM__(__canvas__, iitem){
		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[1].firstElementChild;

		if (icheckbox.checked) {
			__canvas__.item(iitem).visible = !icheckbox.checked;
			// __canvas__.item(iitem).strokeWidth=0;
		}
		
		__canvas__.item(iitem).setColor('transparent');
		__canvas__.renderAll();
	}

	__hiddenITEM__(__canvas__, iitem){

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
			bbs_available.appendChild(current_element);
		}
		__canvas__.item(iitem).setColor('transparent');
		__canvas__.item(iitem).visible = !icheckbox.checked;
		// __canvas__.item(iitem).strokeWidth=icheckbox.checked?0:3;

		icheckbox_edit.checked = false;
		var wrapper = shallow(<ElementITEM canvas={__canvas__} rect={__canvas__.item(iitem)}/>);
		wrapper.find(
			'input[type="checkbox"]'
			).at(1).simulate('change',{ target: { checked: icheckbox_edit.checked } });

		__canvas__.renderAll();
		
		// drawTool.endDraw();
	}

	__eventedITEM__(__canvas__, iitem){
		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[2].firstElementChild;

		__canvas__.item(iitem).selectable = icheckbox.checked;
		__canvas__.discardActiveObject();
		__canvas__.renderAll();

		drawTool.endDraw();
	}

	__deleteITEM__(__canvas__, iitem){
		
		// var b_bs = document.getElementById("b_bs");
		var current_element = document.getElementById("itembb_"+iitem);
		__canvas__.remove(__canvas__.item(iitem))
		__canvas__.renderAll();
		current_element.parentElement.removeChild(current_element);

		//0 1 2 3 [4]
		//0 _ 2 3 [3]
		//0 _ 1 2 [3]

		// var last_element = canvas.item(iitem)
		// canvas.insertAt(object, index);

		for(var i = iitem+1; i < __canvas__.getObjects().length+1; i+=1){
			var xxx = document.getElementById("itembb_"+i);
			xxx.id = "itembb_"+(i-1);
		}
	}
}


const configRectangle = function (__left__, __top__, __width__, __height__){
	var rect = new fabric.Rect({
		left: __left__,
		top: __top__,
		width: __width__,
		height: __height__,

		originX: 'left',
		originY: 'top',
		hasBorder: true,
		stroke: 'blue',
		strokeWidth: 3,
		fill:'transparent',
		transparentCorners: true,
		cornerSize: 10,
		// selectable: false,
		// evented: false,
	});
	rect.KeepStrokeWidth = 3;

	rect.setControlVisible('mtr', false);
	rect.setControlVisible('ml', false);
	rect.setControlVisible('mt', false);
	rect.setControlVisible('mr', false);
	rect.setControlVisible('mb', false);

	return rect;
}

class ElementITEM extends React.Component{

	render(){

		var labelControl = new LabelControl();
		var canvas = this.props.canvas;
		var rect = this.props.rect;
		var namelabel = this.props.namelabel;

		return React.createElement("form", {
			onMouseEnter: function(){labelControl.__overITEM__(canvas, canvas.getObjects().indexOf(rect))},
			onMouseLeave: function(){labelControl.__outITEM__(canvas, canvas.getObjects().indexOf(rect))},
		}, 
		React.createElement("label", null, namelabel), 
		React.createElement("span", null,
			React.createElement("input", {
				type: "checkbox",
				onChange: function(e){labelControl.__hiddenITEM__(canvas, canvas.getObjects().indexOf(rect))}
			}), React.createElement("label", {
			}, "Hidden")), 
		React.createElement("span", null,
			React.createElement("input", {
				type: "checkbox",
				onChange: function(e){labelControl.__eventedITEM__(canvas, canvas.getObjects().indexOf(rect))}
			}), React.createElement("label", {
			}, "Enable")), 
		React.createElement("input", {
			type: "button",
			style: {
				backgroundImage: "url(/static/images/delete.png)",
				backgroundPosition: 'center',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat'
			},
			onClick: function(e){labelControl.__deleteITEM__(canvas, canvas.getObjects().indexOf(rect))}
		}));
	}
}

const createItemToBoundingBoxes = function (canvas, namelabel){
	
	var iitem = canvas.getObjects().length - 1;
	var rect = canvas.item(iitem);
	var new_element =  document.createElement("div");
	new_element.id = "itembb_"+iitem;
	new_element.className = "itembb";

	var bbs_available = document.getElementById("bbs_available");
	bbs_available.appendChild(new_element);

	ReactDOM.render(<ElementITEM canvas={canvas} rect={rect} namelabel={namelabel}/>, new_element);
}


export {createItemToBoundingBoxes, configRectangle, PopupControllers, AllCheckBoxEdit, AllCheckBoxHidden};
