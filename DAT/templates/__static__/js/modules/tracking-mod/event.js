import {ask_before_out} from "../general-mod/request/outWorking";
import {drawStatus, drawTool, controllerRequest, quickSettings, popupControllers} from "../../tracking";
import Color from "../general-mod/style/color";
import {configureLine, configureFlag} from "./drawtool"
import React from "react";
import ReactDOM from "react-dom";
import AlertDialog from "../../materialui/dialog";

var Direction = {
	LEFT: 0,
	UP: 1,
	RIGHT: 2,
	DOWN: 3
};

var zoomLevel = 0;
var zoomLevelMin = 0;
var zoomLevelMax = 3;

var spaceKeyDown = false;
var mouseDownPoint = null;

var objectGlobal = null;
var namelabelGlobal = null;

var dialogChild = null;
var dialog = document.getElementById("dialog");

const on_edit = document.getElementById("on_edit");
const isLabel = function(obj){
	return obj.islabel;
}

const controll_bigplus = function(__canvas__, pointer, out_canvas=true){
	if(drawStatus.getIsDrawing() && !drawStatus.getIsZoom() && !drawStatus.getPopuHover() && out_canvas){
		__canvas__.bigplus[0].set({ y1: pointer.y, x2: __canvas__.getWidth(), y2: pointer.y });
		__canvas__.bigplus[1].set({ x1: pointer.x, x2: pointer.x, y2: __canvas__.getHeight()});
	}
	else{
		__canvas__.bigplus[0].set({y1: 0, x2: 0, y2: 0});
		__canvas__.bigplus[1].set({x1: 0, x2: 0, y2: 0});
	}
}

const init_event = function(__canvas__){
	var group_control = document.getElementById("group_control"+__canvas__.pos);
	
	var bigplus = [
		configureLine([0, 0, 0, 0], Color.WHITE),
		configureLine([0, 0, 0, 0], Color.WHITE),
	];

	bigplus[0].set('isBigPlus', true);
	bigplus[1].set('isBigPlus', true);

	__canvas__.set('bigplus', bigplus);

	__canvas__.add(bigplus[0]);
	__canvas__.add(bigplus[1]);

	if(group_control) {

		group_control.addEventListener('mouseover', function(e){
			var pointer = __canvas__.getPointer(e.e, true);
			group_control.style["display"] = "none";
			drawStatus.setPopuHover(false);
			controll_bigplus(__canvas__, pointer, false);
		});

		try {
			__canvas__.renderAll();
		} catch(e) {
			// statements
			console.log(e);
		}
	}

	window.addEventListener("beforeunload", ask_before_out);

	window.onkeydown = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;
		if(key == 16){
			if(objectGlobal && (isLabel(objectGlobal) || objectGlobal.isIcon)){
				namelabelGlobal = objectGlobal.isIcon ? objectGlobal.object.name : objectGlobal.name;
			}
			else if(drawStatus.getIsDrawing()){
				namelabelGlobal = drawStatus.getNameLabel();
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
		if(drawStatus.getIsChangingLabel()) return;
		var key = e.keyCode ? e.keyCode : e.which;
		if(key == 16 && namelabelGlobal){
			//show all label same class, shift key
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
		if(drawStatus.getIsChangingLabel()) return;
		let key = e.keyCode ? e.keyCode : e.which;
		let isObject = objectGlobal && (isLabel(objectGlobal) || objectGlobal.isIcon);
		let labelControl = objectGlobal ? (objectGlobal.labelControl || objectGlobal.object.labelControl) : null;
		// alert(key);
		if(group_control) {
			group_control.style["display"] = "none";
		}
		
		if(key == 49){
			//copy_1
			if(isObject && labelControl){
				labelControl.__copyToLayerT__();
			}
		}
		else if(key == 50){
			//copy_2
			if(isObject && labelControl){
				labelControl.__copyToLayerB__();
			}
		}
		// else if(key == 97){
		// 	if(dialog && quickSettings.getAtt('ask_dialog')){
		// 		ReactDOM.unmountComponentAtNode(dialog);
		// 		let message = "Skip this data and continue?";
		// 		let request = "rqnext";
		// 		ReactDOM.render(<AlertDialog message={message} request={request} controllerRequest={controllerRequest}/>, dialog);
		// 	}
		// 	else{
		// 		controllerRequest('rqnext');
		// 	}
		// }
		// else if(key == 115){
		// 	if(dialog && quickSettings.getAtt('ask_dialog')){
		// 		ReactDOM.unmountComponentAtNode(dialog);
		// 		let message = "All labels will be save and continue?";
		// 		let request = on_edit ? "rqsave" : "rqsavenext";
		// 		ReactDOM.render(<AlertDialog message={message} request={request} controllerRequest={controllerRequest}/>, dialog);
		// 	}
		// 	else{
		// 		controllerRequest('rqsavenext');
		// 	}
		// }
		else if(key == 99){
			//C key -> Change class label
			if(isObject && labelControl){
				setTimeout(function(){
					drawStatus.setIsChangingLabel(true);
					let changelb = document.getElementById(labelControl.getId()+"_changelabel");
					changelb && changelb.click();
				}, 10);
			}
		}
		else if(key == 101){
			//E key -> Edit
			if(isObject && labelControl){
				labelControl.__editITEM__();
			}
		}
		else if (key == 102){
			//F key -> mark flag false predict
			if(isObject){
				let o = objectGlobal.object || objectGlobal;
				
				if(o.flag != -1 && !o.accept_edit){
					__canvas__.remove(o.shapeflag);
					if(o.flag == 0){
						o.flag = 1;
					}
					else if (o.flag == 1){
						o.flag = 0;
					}
					let flag = configureFlag(o);
					__canvas__.add(flag);
					__canvas__.renderAll();
				}
			}
		}
		else if (key == 104){
			//H key -> hidden
			if(isObject && labelControl){
				labelControl.__hiddenITEM__();
			}
		}
		else if (key == 100){
			//D key -> Delete
			if(isObject && labelControl){
				labelControl.__deleteITEM__();
			}
		}
		else if(key == 113) {
			//quit draw -> q key
			let e_stop = document.getElementById("stop_draw");
			e_stop && e_stop.click();
		}
		else if(key == 114) {
			//r key
			let renew_label = document.getElementById("renew_label");
			renew_label && renew_label.click();
		}
		else if(key == 116){
			//t link label
			let e_linkLabel = document.getElementById("linkLabel_tool");
			e_linkLabel && e_linkLabel.click();
		}
	}

	__canvas__.on({
		'object:scaling': function(e) {
			if(group_control) {
				group_control.style["display"] = "none";
			}
			let obj = e.target,
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
			let obj = e.target;

			if (obj) {
				objectGlobal = obj;
				
				let pos_id;
				
				if(obj.islabel) {
					pos_id = obj.labelControl.getPosId();
				}
				else if (obj.isIcon) {
					pos_id = obj.object.labelControl.getPosId();
				}

				let list_fObj = drawStatus.getObjectsLTM(pos_id);

				for (let pos in list_fObj) {
					let temp_obj = list_fObj[pos];
					temp_obj.labelControl.__overITEM__();
				}

				if(obj.isEditPolygonIcon && !drawStatus.getIsZoom()){
					obj.set('radius', 7);
				}

			}
			else{
				drawTool.setCanvas(__canvas__);
			}
			__canvas__.renderAll();
		},
		'mouse:out': function(e){
			objectGlobal = null;
			let obj = e.target;
			try {

				let pos_id;
				
				if(obj.islabel) {
					pos_id = obj.labelControl.getPosId();
				}
				else if (obj.isIcon) {
					pos_id = obj.object.labelControl.getPosId();
				}

				let list_fObj = drawStatus.getObjectsLTM(pos_id);

				for (let pos in list_fObj) {
					let temp_obj = list_fObj[pos];
					temp_obj.labelControl.__outITEM__();
				}

				if(obj.isEditPolygonIcon){
					let rd = drawStatus.getIsZoom() ? 2 : 4;
					obj.set('radius', rd);
				}
			}
			catch(error) {
				if (!e.target){
					controll_bigplus(__canvas__, null, false);
				}
			}
			__canvas__.renderAll();
		},

		'object:selected': function(e){
			let obj = e.target;
			if(isLabel(obj)){
				objectGlobal = obj;
				popupControllers.popup(obj, __canvas__);
			}
		},
		'mouse:down': function(e){
			if(!__canvas__.getActiveObject())
			{
				if(group_control) {
					group_control.style["display"] = "none";
				}
			}
			if(objectGlobal && (isLabel(objectGlobal) || objectGlobal.isIcon)){
				let labelControl = objectGlobal.labelControl || objectGlobal.object.labelControl;
				let i = drawStatus.getModeTool();
				if(labelControl && i != ""){
					switch (i) {
						case "edit_tool":
							if (!labelControl.getIsEdit()){
								labelControl.__editITEM__();
							}
							break;
						case "hidden_tool":
							labelControl.__hiddenITEM__();
							break;
						case "delete_tool":
							labelControl.__deleteITEM__();
							break;
						case "change_tool":
							let changelb = document.getElementById(labelControl.getId()+"_changelabel");
							changelb && changelb.click();
							break;
						case "copy_t":
							labelControl.__copyToLayerT__();
							break;
						case "copy_b":
							labelControl.__copyToLayerB__();
							break;
						case "linkLabel_tool":
							labelControl.__controlIsLinkLabel__();
							drawStatus.pushLinkLabels(labelControl.getObject());
							break;
						default:
							// statements_def
							break;
					}
				}
			}

			let pointer = __canvas__.getPointer(e.e, true);
			mouseDownPoint = new fabric.Point(pointer.x, pointer.y);

		},
		'mouse:up': function(e){
			mouseDownPoint = null;
		},
		'mouse:move': function(e){

			var pointer = __canvas__.getPointer(e.e, true);
			if(pointer){
				if (spaceKeyDown && mouseDownPoint) {
				var mouseMovePoint = new fabric.Point(pointer.x, pointer.y);
				__canvas__.relativePan(mouseMovePoint.subtract(mouseDownPoint));
				mouseDownPoint = mouseMovePoint;
				keepPositionInBounds(__canvas__);
				
				}
				controll_bigplus(__canvas__, pointer);
				__canvas__.renderAll();
			}
		},
		'object:modified': function(e){
			var obj = e.target;
			if(isLabel(obj)){
				
				obj.icon.set({
					left: obj.left + obj.width / 2,
					top: obj.top + obj.height / 2,
				});
				__canvas__.renderAll();
				popupControllers.popup(obj, __canvas__);
			}
		},
		'object:moving': function(e){
			if(group_control) {
				group_control.style["display"] = "none";
			}
		},
	});

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
		keepPositionInBounds();
	}


	function zoomIn(point) {
		if (__canvas__.zoomLevel < zoomLevelMax) {
			__canvas__.zoomLevel++;
			__canvas__.zoomToPoint(point, Math.pow(2, __canvas__.zoomLevel));
			keepPositionInBounds();

			if(!drawStatus.getActivePolygons()['zs']){
				drawStatus.getActivePolygons()['zs'] = true;
				let listActivePolygons = drawStatus.getActivePolygons();
				for (let id in listActivePolygons){
					if(id!='zs'){
						listActivePolygons[id].circles.forEach( function(c) {
							c.set('radius', 2);
						});
					}
				}
			}
		}
	}

	function zoomOut(point) {
		if (__canvas__.zoomLevel > zoomLevelMin) {
			__canvas__.zoomLevel--;
			__canvas__.zoomToPoint(point, Math.pow(2, __canvas__.zoomLevel));
			keepPositionInBounds();
		}
		if(__canvas__.zoomLevel == 0){
			drawStatus.getActivePolygons()['zs'] = false;
			let listActivePolygons = drawStatus.getActivePolygons();
			for (let id in listActivePolygons){
				if(id!='zs'){
					listActivePolygons[id].circles.forEach( function(c) {
						c.set('radius', 4);
					});
				}
			}
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
			__canvas__.set('defaultCursor', 'move');
			__canvas__.set('selection', false);
			spaceKeyDown = true;
		} else if (key === 37) { // handle Left key
			// move(Direction.LEFT);
			move(Direction.RIGHT);
		} else if (key === 38) { // handle Up key
			// move(Direction.UP);
			move(Direction.DOWN);
		} else if (key === 39) { // handle Right key
			// move(Direction.RIGHT);
			move(Direction.LEFT);
		} else if (key === 40) { // handle Down key
			// move(Direction.DOWN);
			move(Direction.UP);
		}
		drawStatus.setZoomSpaceKey(spaceKeyDown);
	});

	fabric.util.addListener(document.body, 'keyup', function(options) {
		var key = options.which || options.keyCode; // key detection
		if (key == 32) { // handle Space key
			var typeCursor = drawStatus.getIsDrawing() ? 'crosshair' : 'default';
			__canvas__.set('defaultCursor', typeCursor);
			__canvas__.set('selection', true);
			spaceKeyDown = false;
		}
		drawStatus.setZoomSpaceKey(spaceKeyDown);
	});

	var idx = 0;

	switch (__canvas__.pos) {
		case '_full':
			idx = 0;
			break;
		case '_t':
			idx = 1;
			break;
		case '_b':
			idx = 2;
			break;
	};

	var cv_container = document.getElementsByClassName('canvas-container')[idx];

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

export {init_event};