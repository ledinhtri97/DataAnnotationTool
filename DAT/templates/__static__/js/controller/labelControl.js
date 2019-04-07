import React from "react";
import ReactDOM from "react-dom";
import {fabric} from "fabric";
import {drawRect, drawPoly} from "../maintask.js";
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
			var wrapper = shallow(<ElementITEM canvas={canvas} objshape={canvas.item(iitem)}/>);
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
		var wrapper = shallow(<ElementITEM canvas={canvas} objshape={canvas.item(iitem)}/>);
		wrapper.find(
			'input[type="checkbox"]'
			).at(0).simulate('change',{ target: { checked: icheckbox.checked } });
		
	});
}

function triggerSyntheticEvent(canvas, objshape, index, value){
	var wrapper = shallow(<ElementITEM canvas={canvas} objshape={objshape} />); 
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
		// this.__obj__ = __obj__;
		// this.iitem = iitem;
		this.objshape = __obj__;

		var groupcontrol =  document.getElementById("groupcontrol");
		var tabletask = document.getElementById("tabletask");
		var cv_element = document.getElementById("canvas");
		var left = (tabletask.clientWidth - cv_element.clientWidth) / 2;
		var top = (tabletask.clientHeight - cv_element.clientHeight) / 2;
		groupcontrol.style["left"] = (left + this.objshape.oCoords.tl.x) +"px";
		groupcontrol.style["top"] = (top + this.objshape.oCoords.tl.y - 20)+"px";
		groupcontrol.style["display"] = "";
	}
}


class LabelControl{

	constructor(__canvas__, __obj__){
		const lbc = this;
		lbc.canvas = __canvas__;
		lbc.obj = __obj__;

		lbc.getIndex = function(){
			return lbc.canvas.getObjects().indexOf(lbc.obj);
		}
	}

	//__canvas__, iitem
	__overITEM__(){
		var iitem = this.getIndex();
		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[1].firstElementChild;

		if (icheckbox.checked) {
			this.canvas.item(iitem).visible = icheckbox.checked;
			// __canvas__.item(iitem).strokeWidth=3;
		}
		
		this.canvas.item(iitem).setColor('rgba(0,255,0,0.2)');
		this.canvas.renderAll();

	}

	__outITEM__(){
		var iitem = this.getIndex();
		var __canvas__ = this.canvas;

		var current_element = document.getElementById("itembb_"+iitem);
		var icheckbox = current_element.firstElementChild.children[1].firstElementChild;

		if (icheckbox.checked) {
			__canvas__.item(iitem).visible = !icheckbox.checked;
			// __canvas__.item(iitem).strokeWidth=0;
		}
		
		__canvas__.item(iitem).setColor('transparent');
		__canvas__.renderAll();
	}

	__hiddenITEM__(){
		var iitem = this.getIndex();
		var __canvas__ = this.canvas;

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

		icheckbox_edit.checked = false;
		var wrapper = shallow(<ElementITEM canvas={__canvas__} objshape={__canvas__.item(iitem)}/>);
		wrapper.find(
			'input[type="checkbox"]'
			).at(1).simulate('change',{ target: { checked: icheckbox_edit.checked } });

		__canvas__.renderAll();
		
		// drawTool.endDraw();
	}

	

	__eventedITEM__(){
		var iitem = this.getIndex();
		var __canvas__ = this.canvas;
		var lbc = this;

		var current_element = document.getElementById("itembb_"+iitem);
		var label = current_element.firstElementChild.firstElementChild.textContent;
		var icheckbox = current_element.firstElementChild.children[2].firstElementChild;

		__canvas__.item(iitem).selectable = icheckbox.checked;
		__canvas__.discardActiveObject();
		

		if (__canvas__.item(iitem).type == 'polygon'){
			__canvas__.item(iitem).selectable = false;
			if(icheckbox.checked){
				// var gr = []
				lbc.obj.points.forEach(function(point, index) {
					var circle = new fabric.Circle({
						radius: 7,
						fill: 'yellow',
						left: point.x,
						top: point.y,
						originX: 'center',
						originY: 'center',
						hasBorders: false,
						hasControls: false,
						name: index+"_"+iitem
					});
					circle.on('moving', function(){

						var p = circle;
						var __index__ = parseInt(p.name.split('_')[0]);
						// console.log("circle moving \n");
						lbc.obj.points[__index__] = {x: p.getCenterPoint().x, y: p.getCenterPoint().y};

						__canvas__.remove(lbc.obj);
						lbc.obj = new fabric.Polygon(lbc.obj.points, {
							hasControls: false,
							originX: 'left',
							originY: 'top',
							hasBorder: false,
							stroke: 'blue',
							strokeWidth: 3,
							fill:'transparent',
							transparentCorners: true,
							cornerSize: 10,
							objectCaching: false,
							selectable: false,
						});

						__canvas__.insertAt(lbc.obj, iitem);
						// __canvas__.sendToBack(lbc.obj);
						
						__canvas__.renderAll();
					});
					circle.on('moved', function(){

						__canvas__.remove(lbc.obj);

						lbc.obj = new fabric.Polygon(lbc.obj.points, {
							hasControls: false,
							originX: 'left',
							originY: 'top',
							hasBorder: false,
							stroke: 'blue',
							strokeWidth: 3,
							fill:'transparent',
							transparentCorners: true,
							cornerSize: 10,
							objectCaching: false,
							selectable: false,
						});

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
						__canvas__.remove(obj);
					}
				});
			}
		}

		__canvas__.renderAll();
		drawRect.endDraw();
		drawPoly.endDraw();
	}

	__deleteITEM__(){
		var iitem = this.getIndex();
		var __canvas__ = this.canvas;

		var map_obj = {};
		var circles = [];

		__canvas__.getObjects().forEach(function(obj, index){
			if(obj.type=='circle'){
				circles.push(obj);
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
			for(var c of circles){
				var spl = parseInt(c.name.split('_'));
				var __iitem__ = spl[1];
				if(__iitem__ == iitem){
					c.name = 'delete';
				}
				else if (__iitem__ == i){
					c.name = spl[0]+'_'+renewiitem;
				}
			}
		}

		for(var c of circles){
			if (c.name != 'delete'){
				__canvas__.add(c);
			}
		}
		__canvas__.renderAll();
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
		noScaleCache: false,
		// selectable: false,
		// evented: false,
	});
	
	rect.setControlVisible('mtr', false);
	rect.setControlVisible('ml', false);
	rect.setControlVisible('mt', false);
	rect.setControlVisible('mr', false);
	rect.setControlVisible('mb', false);

	return rect;
}

class ElementITEM extends React.Component{

	render(){

		var labelControl = new LabelControl(this.props.canvas, this.props.objshape);
		// var canvas = this.props.canvas;
		// var objshape = this.props.objshape;
		// 
		//canvas, canvas.getObjects().indexOf(objshape)
		var namelabel = this.props.namelabel;

		return React.createElement("form", {
			onMouseEnter: function(){labelControl.__overITEM__()},
			onMouseLeave: function(){labelControl.__outITEM__()},
		}, 
		React.createElement("label", null, namelabel), 
		React.createElement("span", null,
			React.createElement("input", {
				type: "checkbox",
				onChange: function(e){labelControl.__hiddenITEM__()}
			}), React.createElement("label", {
			}, "Hidden")), 
		React.createElement("span", null,
			React.createElement("input", {
				type: "checkbox",
				onChange: function(e){labelControl.__eventedITEM__()}
			}), React.createElement("label", {
			}, "Enable")), 
		React.createElement("input", {
			type: "button",
			style: {
				backgroundImage: "url(/gvlab-dat/static/images/delete.png)",
				backgroundPosition: 'center',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat'
			},
			onClick: function(e){labelControl.__deleteITEM__()}
		}));
	}
}

const createItemToBoundingBoxes = function (canvas, namelabel, __iitem__=-1){
	
	var bbs_available = document.getElementById("bbs_available");
	var new_element =  document.createElement("div");
	new_element.className = "itembb";

	if(__iitem__==-1){
		var iitem = canvas.getObjects().length - 1;
		var objshape = canvas.item(iitem);
		new_element.id = "itembb_"+iitem;
		bbs_available.appendChild(new_element);
	}
	else{
		var objshape = canvas.item(__iitem__);
		new_element.id = "itembb_"+__iitem__;
		if (__iitem__ == 0){
			bbs_available.insertBefore(new_element, bbs_available.firstElementChild);
		}
		else{
			var beforeChild = document.getElementById("itembb_"+(__iitem__-1));
			bbs_available.insertBefore(new_element, beforeChild.nextSibling);

		}
		try {
			bbs_available.removeChild(new_element.nextSibling);
		} catch(e) {
			console.log(e);
		}
	}
	ReactDOM.render(<ElementITEM canvas={canvas} objshape={objshape} namelabel={namelabel}/>, new_element);
}


export {createItemToBoundingBoxes, configRectangle, PopupControllers, AllCheckBoxEdit, AllCheckBoxHidden};
