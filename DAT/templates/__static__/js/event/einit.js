import {drawRect, drawPoly} from "../maintask"
import {Color} from '../style/color'
import React from "react";
import ReactDOM from "react-dom";
import {drawStatus} from "../maintask";
import {ElementITEM} from "../controller/itemReact";
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

var Direction = {
	LEFT: 0,
	UP: 1,
	RIGHT: 2,
	DOWN: 3
};

var zoomLevel = 0;
var zoomLevelMin = 0;
var zoomLevelMax = 3;

var shiftKeyDown = false;
var mouseDownPoint = null;

var objectShape = null;
var labelselect = document.getElementById("labelselect");
// var label = document.getElementById("label");

var formSubmitting = false;
var setFormSubmitting = function() { formSubmitting = true; };

const init_event = function(__canvas__, popupControllers){

	window.onload = function() {
		window.addEventListener("beforeunload", function (e) {
			if (formSubmitting) {
				return undefined;
			}

			var confirmationMessage = 'Có vẻ như bạn đang chỉnh sửa một số thứ. '
			+ 'Nếu bạn rời khỏi hay tải lại trang hiện tại trước khi lưu dữ liệu. Dữ liệu có thể sẽ mất';

			(e || window.event).returnValue = confirmationMessage; //Gecko + IE
			return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
		});
	};

	window.onkeypress = function(e){
		var key = e.keyCode ? e.keyCode : e.which;

		if(key == 101){
			//E key -> Edit
			if(objectShape && objectShape.type!='circle'){
				document.getElementById("groupcontrol").style["display"] = "none";
				var iitem = __canvas__.getObjects().indexOf(objectShape)
				var current_element = document.getElementById("itembb_"+iitem);
				var icheckbox = current_element.firstElementChild.children[2].firstElementChild;

				icheckbox.checked = !icheckbox.checked;
				var wrapper = shallow(<ElementITEM canvas={__canvas__} objshape={objectShape}/>);
				wrapper.find(
					'input[type="checkbox"]'
					).at(1).simulate('change',{ target: { checked: icheckbox.checked } });
			}
		}
		else if (key == 104){
			//H key -> hidden
			if(objectShape && objectShape.type!='circle'){
				document.getElementById("groupcontrol").style["display"] = "none";
				var iitem = __canvas__.getObjects().indexOf(objectShape)
				var current_element = document.getElementById("itembb_"+iitem);
				var icheckbox = current_element.firstElementChild.children[1].firstElementChild;
				icheckbox.checked = !icheckbox.checked;

				var wrapper = shallow(<ElementITEM canvas={__canvas__} objshape={objectShape}/>); 
				wrapper.find(
					'input[type="checkbox"]'
					).at(0).simulate('change',{ target: { checked: icheckbox.checked } });
			}
		}
		else if (key == 100){
			//D key -> Delete
			if(objectShape && objectShape.type!='circle'){
				var wrapper = shallow(<ElementITEM canvas={__canvas__} objshape={objectShape} />);
				wrapper.find('input[type="button"]').simulate('click');
				document.getElementById("groupcontrol").style["display"] = "none";
			}
		}
		else if(key == 113) {
			//quit draw -> q key
			drawPoly.endDraw();
		}
		//draw-keyboard shortcut
		Array.from(labelselect.children).forEach(function(elem, index) {
			var spl = elem.textContent.split('-');
			var isd = drawStatus.getIsDrawing();
			if(!isd && (key == 49+index)){
				drawPoly.setType(spl[1]);
				drawPoly.startDraw(spl[0]);
			}
		});
	}

	__canvas__.on({
		'object:scaling': function(e) {
			document.getElementById("groupcontrol").style["display"] = "none";
			var obj = e.target,
			width = obj.width,
			height = obj.height,
			scaleX = obj.scaleX,
			scaleY = obj.scaleY;
			obj.set({
				width : width * scaleX,
				height : height * scaleY,
				scaleX: 1,
				scaleY: 1
			}); 

		},
		'mouse:over': function(e){
			var obj = e.target;

			if (obj){
				objectShape = obj;

				if (obj.type != "circle"){
					obj.set('fill', Color.Opacity_GREEN);
					var iitem = __canvas__.getObjects().indexOf(obj);
					var current_element = document.getElementById("itembb_"+iitem);
					if (current_element) {
						var icheckbox = current_element.firstElementChild.children[2].firstElementChild;
						//bug moving polygon without circle on edit
						if(obj.type != 'polygon'){
							obj.selectable = icheckbox.checked;
						}
						else{
							obj.selectable = false;
						}
						popupControllers.popup(obj);
					}
				}
			}
			__canvas__.renderAll();
		},
		'mouse:out': function(e){
			objectShape = null;
			try {
				if (e.target.type != "circle"){
					e.target.set('fill', Color.Transparent);
					__canvas__.renderAll();	
				}
			}
			catch(error) {

			}
		},
		'object:selected': function(e){
			if(e.target.type != "circle"){
			// var iitem = __canvas__.getObjects().indexOf(e.target);
			objectShape = e.target;
			popupControllers.popup(e.target);
		}
	},
	'mouse:down': function(e){
		if(!__canvas__.getActiveObject())
		{
			document.getElementById("groupcontrol").style["display"] = "none";
		}
		//ZOOM PART
		var pointer = __canvas__.getPointer(e.e, true);
		mouseDownPoint = new fabric.Point(pointer.x, pointer.y);

	},
	'mouse:up': function(e){
		//ZOOM PART
		mouseDownPoint = null;
	},
	'mouse:move': function(e){
		//ZOOM PART
		if (shiftKeyDown && mouseDownPoint) {
			var pointer = __canvas__.getPointer(e.e, true);
			var mouseMovePoint = new fabric.Point(pointer.x, pointer.y);
			__canvas__.relativePan(mouseMovePoint.subtract(mouseDownPoint));
			mouseDownPoint = mouseMovePoint;
			keepPositionInBounds(__canvas__);
		}
	},
	'object:modified': function(e){
		if(e.target.type != "circle"){
			// var iitem = __canvas__.getObjects().indexOf(e.target);
			popupControllers.popup(e.target);
		}
	},
	'object:moving': function(e){
		document.getElementById("groupcontrol").style["display"] = "none";
	},});

	//===================BEGIN ZOOM PART======================//

	function getWheelDelta(event) {
		return event.wheelDelta || -event.detail || event.originalEvent.wheelDelta || -event.originalEvent.detail || -(event.originalEvent.deltaY * 25) || null;
	}

	const MouseWheelHandler = function(options){
		document.getElementById("groupcontrol").style["display"] = "none";
		var delta = getWheelDelta(options);
		if (delta != 0) {
			var pointer = __canvas__.getPointer(options.e, true);
			var point = new fabric.Point(pointer.x, pointer.y);
			if (delta > 0) {
				zoomIn(point);
			} else if (delta < 0) {
				zoomOut(point);
			}
		}
	}

	function move(direction) {
		switch (direction) {
			case Direction.LEFT:
			__canvas__.relativePan(new fabric.Point(-10 * __canvas__.getZoom(), 0));
			break;
			case Direction.UP:
			__canvas__.relativePan(new fabric.Point(0, -10 * __canvas__.getZoom()));
			break;
			case Direction.RIGHT:
			__canvas__.relativePan(new fabric.Point(10 * __canvas__.getZoom(), 0));
			break;
			case Direction.DOWN:
			__canvas__.relativePan(new fabric.Point(0, 10 * __canvas__.getZoom()));
			break;
		}
		keepPositionInBounds(__canvas__);
	}


	function zoomIn(point) {
		if (zoomLevel < zoomLevelMax) {
			zoomLevel++;
			__canvas__.zoomToPoint(point, Math.pow(2, zoomLevel));
			keepPositionInBounds(__canvas__);
		}
	}

	function zoomOut(point) {
		if (zoomLevel > zoomLevelMin) {
			zoomLevel--;
			__canvas__.zoomToPoint(point, Math.pow(2, zoomLevel));
			keepPositionInBounds(__canvas__);
		}
	}

	function keepPositionInBounds() {
		var zoom = __canvas__.getZoom();
		var xMin = (2 - zoom) * __canvas__.getWidth() / 2;
		var xMax = zoom * __canvas__.getWidth() / 2;
		var yMin = (2 - zoom) * __canvas__.getHeight() / 2;
		var yMax = zoom * __canvas__.getHeight() / 2;

		var point = new fabric.Point(__canvas__.getWidth() / 2, __canvas__.getHeight() / 2);
		var center = fabric.util.transformPoint(point, __canvas__.viewportTransform);

		var clampedCenterX = clamp(center.x, xMin, xMax);
		var clampedCenterY = clamp(center.y, yMin, yMax);

		var diffX = clampedCenterX - center.x;
		var diffY = clampedCenterY - center.y;

		if (diffX != 0 || diffY != 0) {
			__canvas__.relativePan(new fabric.Point(diffX, diffY));
		}
	}

	function clamp(value, min, max) {
		return Math.max(min, Math.min(value, max));
	}

	fabric.util.addListener(document.body, 'keydown', function(options) {
		if (options.repeat) {
			return;
		}
		document.getElementById("groupcontrol").style["display"] = "none";
		var key = options.which || options.keyCode; // key detection
		if (key == 32) { // handle Shift key
			__canvas__.defaultCursor = 'move';
			__canvas__.selection = false;
			shiftKeyDown = true;
		} else if (key === 37) { // handle Left key
			move(Direction.LEFT);
		} else if (key === 38) { // handle Up key
			move(Direction.UP);
		} else if (key === 39) { // handle Right key
			move(Direction.RIGHT);
		} else if (key === 40) { // handle Down key
			move(Direction.DOWN);
		}
	});

	fabric.util.addListener(document.body, 'keyup', function(options) {
		var key = options.which || options.keyCode; // key detection
		if (key == 32) { // handle Shift key
			__canvas__.defaultCursor = 'default';
			__canvas__.selection = true;
			shiftKeyDown = false;
		}
	});

	var cv_container = document.getElementsByClassName('canvas-container')[0];

	if (cv_container.addEventListener) {
    	// IE9, Chrome, Safari, Opera
    	cv_container.addEventListener("mousewheel", MouseWheelHandler, false);
    	// Firefox
    	cv_container.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else {
    	cv_container.attachEvent("onmousewheel", MouseWheelHandler);
    }

    //===================BEGIN ZOOM PART======================//
	//
}

export {init_event};

