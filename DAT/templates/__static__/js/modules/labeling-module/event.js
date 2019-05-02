import {ask_before_out} from "../dat-utils"
import {drawStatus, drawPoly, controllerRequest, quickSettings} from "../../labeling"
import {Color} from './style/color'
import {configureLine} from "./drawer/polygon"
import React from "react";
import ReactDOM from "react-dom";
import AlertDialog from "../../materialui/dialog";

var Direction = {
	LEFT: 0,
	UP: 1,
	RIGHT: 2,
	DOWN: 3
};

var bigplus = [];
var storageObj = {};
var zoomLevel = 0;
var zoomLevelMin = 0;
var zoomLevelMax = 3;

var spaceKeyDown = false;
var mouseDownPoint = null;

var objectGlobal = null;
var namelabelGlobal = null;
var labelselect = document.getElementById("label_select");

var dialogChild = null;
var dialog = document.getElementById("dialog");


const size_icon = document.getElementById("size_icon");
const width_stroke = document.getElementById("width_stroke");


const validObjectShape = function(obj){
	// return obj.type != 'circle' && obj.type != 'line' && obj.type != 'image';
	return obj.type == 'rect' || obj.type == 'polygon';
}

const reset_when_go =  function(){
	bigplus.splice(0, bigplus.length);
	for (var i in storageObj){
		delete storageObj[i];
	}
}


const controll_bigplus = function(__canvas__, pointer){
	if(drawStatus.getIsDrawing() && !drawStatus.getIsZoom() && !drawStatus.getPopuHover()){
		if(bigplus.length == 0){

			var x = configureLine([0, pointer.y, __canvas__.getWidth(), pointer.y], Color.WHITE);
			var y = configureLine([pointer.x, 0, pointer.x,__canvas__.getHeight()], Color.WHITE);
			bigplus.push(x);
			bigplus.push(y);
			__canvas__.add(x);
			__canvas__.add(y);

		}
		else{
			bigplus[0].set({ y1: pointer.y, y2: pointer.y });
			bigplus[1].set({ x1: pointer.x, x2: pointer.x });
		}		
	}
	else{
		if(bigplus.length != 0){
			__canvas__.getObjects().forEach(function(obj, index){
				if(validObjectShape(obj)){
					storageObj[index] = obj;
				}
			});
			__canvas__.remove(bigplus[0]);
			__canvas__.remove(bigplus[1]);

			for(var i in storageObj){
				var xxx = document.getElementById("itembb_"+i);
				var renewiitem = __canvas__.getObjects().indexOf(storageObj[i]);
				if(xxx && renewiitem!=-1){
					xxx.id = "itembb_"+renewiitem;
				}
			}

			reset_when_go();
		}
	}
	__canvas__.renderAll();
}

const init_event = function(__canvas__, popupControllers){
	var group_control = document.getElementById("group_control");
	if(group_control) {

		group_control.addEventListener('mouseover', function(e){
			var pointer = __canvas__.getPointer(e.e, true);
			group_control.style["display"] = "";
			drawStatus.setPopuHover(true);
			controll_bigplus(__canvas__, pointer);
		});
		
		group_control.addEventListener('mouseout', function(e){
			var pointer = __canvas__.getPointer(e.e, true);
			group_control.style["display"] = "none";
			drawStatus.setPopuHover(false);
			controll_bigplus(__canvas__, pointer);
		});
	}

	window.onload = function() {
		window.addEventListener("beforeunload", ask_before_out)
	};

	window.onkeydown = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;
		if(key == 16){
			if(objectGlobal && (validObjectShape(objectGlobal) || objectGlobal.name_id == 'icon')){
				namelabelGlobal = objectGlobal.name_id ? objectGlobal.object.name : objectGlobal.name;
			}
			else if(drawStatus.getIsDrawing()){
				namelabelGlobal = drawStatus.getNamelabel();
			}
			if(namelabelGlobal){
				__canvas__.getObjects().forEach(function (obj) {
					if(obj.name == namelabelGlobal && obj.hidden){
						obj.visible = true;
					}
				});
				__canvas__.renderAll();
			}
		}
	};

	window.onkeyup = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;
		if(key == 16 && namelabelGlobal){
			__canvas__.getObjects().forEach(function (obj) {
				if(obj.name == namelabelGlobal && obj.hidden){
					obj.visible = false;
				}
			});
			__canvas__.renderAll();
			namelabelGlobal = null;
		}
	};

	window.onkeypress = function(e){
		var key = e.keyCode ? e.keyCode : e.which;
		// alert(key);
		if(key == 97){
			if(dialog && quickSettings.getAtt('ask_dialog')){
				ReactDOM.unmountComponentAtNode(dialog);
				var message = "Skip this data and continue?";
				var request = "rqnext";
				ReactDOM.render(<AlertDialog message={message} request={request}/>, dialog);
			}
			else{
				controllerRequest('rqnext');
			}
		}
		else if (key == 98) {
			if(dialog && quickSettings.getAtt('ask_dialog')){
				ReactDOM.unmountComponentAtNode(dialog);
				var message = "Are you sure this is bad data and want to continue?";
				var request = "rqbadnext";
				ReactDOM.render(<AlertDialog message={message} request={request}/>, dialog);
			}
			else{
				controllerRequest('rqbadnext');
			}
		}
		else if(key == 115){
			if(dialog && quickSettings.getAtt('ask_dialog')){
				ReactDOM.unmountComponentAtNode(dialog);
				var message = "All labels will be save and continue?";
				var request = "rqsavenext";
				ReactDOM.render(<AlertDialog message={message} request={request}/>, dialog);
			}
			else{
				controllerRequest('rqsavenext');
			}
		}
		else if(key == 101){
			//E key -> Edit
			if(objectGlobal && (validObjectShape(objectGlobal) || objectGlobal.name_id == 'icon')){
				if(group_control) {
					group_control.style["display"] = "none";
				}
				var labelControl = objectGlobal.labelControl || objectGlobal.object.labelControl;

				if(labelControl){
					if(objectGlobal.object && objectGlobal.object.hidden){
						var e_hidden = document.getElementById(labelControl.getId()+"_hidden");
						e_hidden && e_hidden.click();
					}
					labelControl.__editITEM__();
				}
			}
		}
		else if (key == 104){
			//H key -> hidden
			if(objectGlobal && (validObjectShape(objectGlobal) || objectGlobal.name_id == 'icon')){
				if(group_control) {
					group_control.style["display"] = "none";
				}
				var labelControl = objectGlobal.labelControl || objectGlobal.object.labelControl;
				if(labelControl){
					var e_hidden = document.getElementById(labelControl.getId()+"_hidden");
					e_hidden && e_hidden.click();
				}
			}
		}
		else if (key == 100){
			//D key -> Delete
			if(objectGlobal && (validObjectShape(objectGlobal) || objectGlobal.name_id == 'icon')){
				if(group_control) {
					group_control.style["display"] = "none";
				}
				var labelControl = objectGlobal.labelControl || objectGlobal.object.labelControl;
				if(labelControl){
					var e_delete = document.getElementById(labelControl.getId()+"_delete");
					e_delete && e_delete.click();
				}
			}
		}
		else if(key == 113) {
			//quit draw -> q key
			if(drawStatus.getIsDrawing()){
				document.getElementById("stop_mode").textContent = "Stop labeling mode";
				drawPoly.endDraw();
			}
			else{
				document.getElementById("stop_mode").textContent = "You are not in labeling mode";
			}
		}
		else {
			if(labelselect){
				var labels = JSON.parse(labelselect.textContent)['labels'];
				labels.pop();

				labels.forEach(function(elem, index) {
					var spl = elem.id.split('-');
					var isd = drawStatus.getIsDrawing();
					var isw = drawStatus.getIsWaiting();
					if((!isd || (isd && isw)) && (key == 49+index)){
						drawPoly.setType(spl[1]);
						drawPoly.startDraw(spl[0]);
					}
				});
			}
		}
	}

	__canvas__.on({
		'object:scaling': function(e) {
			if(group_control) {
				group_control.style["display"] = "none";
			}
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
				objectGlobal = obj;

				if (validObjectShape(obj)){
					if (obj.labelControl && !obj.hidden) {
						obj.set('fill', Color.Opacity_GREEN);
						if(obj.type != 'polygon'){
							obj.selectable = obj.labelControl.getIsEdit();
						}
						else{
							obj.selectable = false;
						}
						popupControllers.popup(obj);
					}
				}
				else if(obj.name_id == 'icon'){
					obj.object.visible = true;
					popupControllers.popup(obj);
				}
			}
			__canvas__.renderAll();
		},
		'mouse:out': function(e){
			objectGlobal = null;
			var obj = e.target;
			try {
				if (validObjectShape(obj)){
					obj.set('fill', Color.Transparent);
				}
				else if(obj.name_id == 'icon'){
					obj.object.visible = false;
					if(group_control) {
						group_control.style["display"] = "none";
					}
				}
				__canvas__.renderAll();	
			}
			catch(error) {

			}
		},
		'object:selected': function(e){
			var obj = e.target;
			if(validObjectShape(obj)){
				objectGlobal = obj;
				popupControllers.popup(obj);
			}
		},
		'mouse:down': function(e){
			if(!__canvas__.getActiveObject())
			{
				if(group_control) {
					group_control.style["display"] = "none";
				}
			}

			var pointer = __canvas__.getPointer(e.e, true);
			mouseDownPoint = new fabric.Point(pointer.x, pointer.y);

		},
		'mouse:up': function(e){
			mouseDownPoint = null;
		},
		'mouse:move': function(e){

			var pointer = __canvas__.getPointer(e.e, true);
			controll_bigplus(__canvas__, pointer);

			var label = document.getElementById("label");
			if (spaceKeyDown && mouseDownPoint) {
				var mouseMovePoint = new fabric.Point(pointer.x, pointer.y);
				__canvas__.relativePan(mouseMovePoint.subtract(mouseDownPoint));
				mouseDownPoint = mouseMovePoint;
				keepPositionInBounds(__canvas__);
			}		
			__canvas__.renderAll();
		},
		'object:modified': function(e){
			var obj = e.target;
			if(validObjectShape(obj)){
				
				obj.icon.set({
					left: obj.left + obj.width / 2,
					top: obj.top + obj.height / 2,
				});

				__canvas__.renderAll();

				popupControllers.popup(obj);
			}
		},
		'object:moving': function(e){
			if(group_control) {
					group_control.style["display"] = "none";
				}
		},});

	//===================BEGIN ZOOM PART======================//

	function getWheelDelta(event) {
		return event.wheelDelta || -event.detail || event.originalEvent.wheelDelta || -event.originalEvent.detail || -(event.originalEvent.deltaY * 25) || null;
	}

	const MouseWheelHandler = function(options){
		if(group_control) {
					group_control.style["display"] = "none";
				}
		var delta = getWheelDelta(options);
		if (delta != 0) {
			drawStatus.setIsZoom(true);
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
		if(zoomLevel == 0){
			drawStatus.setIsZoom(false);
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
		if(group_control) {
					group_control.style["display"] = "none";
				}
		var key = options.which || options.keyCode; // key detection
		if (key == 32) { // handle Space key
			__canvas__.defaultCursor = 'move';
			__canvas__.selection = false;
			spaceKeyDown = true;
		} else if (key === 37) { // handle Left key
			move(Direction.LEFT);
		} else if (key === 38) { // handle Up key
			move(Direction.UP);
		} else if (key === 39) { // handle Right key
			move(Direction.RIGHT);
		} else if (key === 40) { // handle Down key
			move(Direction.DOWN);
		}
		drawStatus.setZoomSpaceKey(spaceKeyDown);
	});

	fabric.util.addListener(document.body, 'keyup', function(options) {
		var key = options.which || options.keyCode; // key detection
		if (key == 32) { // handle Shift key
			var typeCursor = drawStatus.getIsDrawing() ? 'crosshair' : 'default';
			__canvas__.defaultCursor = typeCursor;
			__canvas__.selection = true;
			spaceKeyDown = false;
		}
		drawStatus.setZoomSpaceKey(spaceKeyDown);
	});

	var cv_container = document.getElementsByClassName('canvas-container')[0];

	if(cv_container){
		if (cv_container.addEventListener) {
    	// IE9, Chrome, Safari, Opera
    	cv_container.addEventListener("mousewheel", MouseWheelHandler, false);
    	// Firefox
    	cv_container.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else {
    	cv_container.attachEvent("onmousewheel", MouseWheelHandler);
    }
}

    //===================BEGIN ZOOM PART======================//
	//
}

export {init_event, reset_when_go};

