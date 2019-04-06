// import React from "react";
// import ReactDOM from "react-dom";
import {fabric} from 'fabric';
// import {FaceRequest, Tableinfo} from "./api/FaceRequest";
import {requestFaceAPI} from "./api/faceRequest";
import {requestPersonAPI} from "./api/personRequest";
import {requestNextMetaData} from "./controller/next";
import {requestSaveAndNext} from  "./controller/saveNnext"
import {initMaintask, outWorkSpace} from "./controller/renderInit"
import {DrawReactangle} from "./drawer/rectangle"
import {DrawQuadrilateral} from "./drawer/quadrilateral"
import {PopupControllers, AllCheckBoxEdit, AllCheckBoxHidden} from "./controller/labelControl";

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

const canvas = new fabric.Canvas('canvas', {
	hoverCursor: 'pointer',
	selection: true,
	selectionBorderColor: 'green',
	backgroundColor: null,
});

const groupcontrol =  document.getElementById("groupcontrol");

groupcontrol.addEventListener('mouseover', function(e){
	groupcontrol.style["display"] = "";
});

groupcontrol.addEventListener('mouseout', function(e){
	groupcontrol.style["display"] = "none";
});

const popupControllers = new PopupControllers(canvas);

canvas.on({
	'object:scaling': function(e) {
		document.getElementById("groupcontrol").style["display"] = "none";
		var obj = e.target;
		if(obj.KeepStrokeWidth){
			var newStrokeWidth = obj.KeepStrokeWidth / ((obj.scaleX + obj.scaleY) / 2);
			obj.set('strokeWidth',newStrokeWidth);
			canvas.renderAll();
		}
	},
	'mouse:over': function(e){
		var obj = e.target;

		if (obj){
			if (obj.type != "circle"){
				obj.set('fill', 'rgba(0,255,0,0.2)');
				var iitem = canvas.getObjects().indexOf(obj);
				var current_element = document.getElementById("itembb_"+iitem);
				var icheckbox = current_element.firstElementChild.children[2].firstElementChild;
				obj.selectable = icheckbox.checked;
				popupControllers.popup(obj, iitem);
			}
		}
		canvas.renderAll();
	},
	'mouse:out': function(e){
		try {
			if (e.target.type != "circle"){
				e.target.set('fill', 'transparent');
				canvas.renderAll();	
			}
		}
		catch(error) {
			
		}
	},
	'object:selected': function(e){
		var iitem = canvas.getObjects().indexOf(e.target);
		popupControllers.popup(e.target, iitem);
	},
	'mouse:down': function(e){
		if(!canvas.getActiveObject())
		{
			document.getElementById("groupcontrol").style["display"] = "none";
		}
		//ZOOM PART
		var pointer = canvas.getPointer(e.e, true);
		mouseDownPoint = new fabric.Point(pointer.x, pointer.y);

	},
	'mouse:up': function(e){
		//ZOOM PART
		mouseDownPoint = null;

	},
	'mouse:move': function(e){
		//ZOOM PART
		if (shiftKeyDown && mouseDownPoint) {
			var pointer = canvas.getPointer(e.e, true);
			var mouseMovePoint = new fabric.Point(pointer.x, pointer.y);
			canvas.relativePan(mouseMovePoint.subtract(mouseDownPoint));
			mouseDownPoint = mouseMovePoint;
			keepPositionInBounds(canvas);
		}
	},
	'object:modified': function(e){
		var iitem = canvas.getObjects().indexOf(e.target);
		popupControllers.popup(e.target, iitem);
	},
	'object:moving': function(e){
		document.getElementById("groupcontrol").style["display"] = "none";

	},
});


//===================BEGIN ZOOM PART======================//
//

fabric.util.addListener(document.body, 'keydown', function(options) {
	if (options.repeat) {
		return;
	}
	document.getElementById("groupcontrol").style["display"] = "none";
	var key = options.which || options.keyCode; // key detection
	if (key == 32) { // handle Shift key
		canvas.defaultCursor = 'move';
		canvas.selection = false;
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
		canvas.defaultCursor = 'default';
		canvas.selection = true;
		shiftKeyDown = false;
	}
});

function getWheelDelta(event) {
	return event.wheelDelta || -event.detail || event.originalEvent.wheelDelta || -event.originalEvent.detail || -(event.originalEvent.deltaY * 25) || null;
}

const MouseWheelHandler = function(options){
	document.getElementById("groupcontrol").style["display"] = "none";
	var delta = getWheelDelta(options);
	if (delta != 0) {
		var pointer = canvas.getPointer(options.e, true);
		var point = new fabric.Point(pointer.x, pointer.y);
		if (delta > 0) {
			zoomIn(point);
		} else if (delta < 0) {
			zoomOut(point);
		}
	}
}

var cv_container = document.getElementsByClassName('canvas-container')[0];

// cv_container.addEventListener('mousewheel', function(options) 
// });
if (cv_container.addEventListener) {
    // IE9, Chrome, Safari, Opera
    cv_container.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    cv_container.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
}
// IE 6/7/8
else {
	cv_container.attachEvent("onmousewheel", MouseWheelHandler);
}

function move(direction) {
	switch (direction) {
		case Direction.LEFT:
		canvas.relativePan(new fabric.Point(-10 * canvas.getZoom(), 0));
		break;
		case Direction.UP:
		canvas.relativePan(new fabric.Point(0, -10 * canvas.getZoom()));
		break;
		case Direction.RIGHT:
		canvas.relativePan(new fabric.Point(10 * canvas.getZoom(), 0));
		break;
		case Direction.DOWN:
		canvas.relativePan(new fabric.Point(0, 10 * canvas.getZoom()));
		break;
	}
	keepPositionInBounds(canvas);
}


function zoomIn(point) {
	if (zoomLevel < zoomLevelMax) {
		zoomLevel++;
		canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
		keepPositionInBounds(canvas);
	}
}

function zoomOut(point) {
	if (zoomLevel > zoomLevelMin) {
		zoomLevel--;
		canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
		keepPositionInBounds(canvas);
	}
}

function keepPositionInBounds() {
	var zoom = canvas.getZoom();
	var xMin = (2 - zoom) * canvas.getWidth() / 2;
	var xMax = zoom * canvas.getWidth() / 2;
	var yMin = (2 - zoom) * canvas.getHeight() / 2;
	var yMax = zoom * canvas.getHeight() / 2;

	var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
	var center = fabric.util.transformPoint(point, canvas.viewportTransform);

	var clampedCenterX = clamp(center.x, xMin, xMax);
	var clampedCenterY = clamp(center.y, yMin, yMax);

	var diffX = clampedCenterX - center.x;
	var diffY = clampedCenterY - center.y;

	if (diffX != 0 || diffY != 0) {
		canvas.relativePan(new fabric.Point(diffX, diffY));
	}
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(value, max));
}

//===================END ZOOM PART======================//
//

initMaintask(
	canvas, 
	document.getElementById('imgurl').href, 
	document.getElementById("bbsfirst").textContent
	);

//===================DEFAULT-INIT======================//
//

const metaid = document.getElementById("metaid");

//=======================API===========================//
//

// const btnFace = document.getElementById("facedet");

// if (btnFace){
// 	btnFace.addEventListener('click', function(){
// 		document.getElementById("groupcontrol").style["display"] = "none";
// 		requestFaceAPI(metaid.textContent, canvas);
// 	});
// }


// const btnPerson = document.getElementById("persondet");

// if (btnPerson){
// 	btnPerson.addEventListener('click', function(){
// 		document.getElementById("groupcontrol").style["display"] = "none";
// 		requestPersonAPI(metaid.textContent, canvas);
// 	});
// }



//=====================CONTROLER=======================//
//
const btnNext = document.getElementById("next");

btnNext.addEventListener('click', function(){
	document.getElementById("groupcontrol").style["display"] = "none";
	requestNextMetaData(metaid.textContent, canvas);
});

const btnSaveandNext = document.getElementById("savennext");

btnSaveandNext.addEventListener('click', function(){
	document.getElementById("groupcontrol").style["display"] = "none";
	requestSaveAndNext(metaid.textContent, canvas);
})

//=======================DRAWER=======================//
//

const drawTool = new DrawReactangle(canvas, "face");
var labelSelector = document.getElementById("labelSelect");
var label = document.getElementById("label");
var btnEnd = document.getElementById("end");

Array.from(labelSelector.children).forEach(function(elem) {
	elem.addEventListener('click', function(){
		drawTool.endDraw();
		label.textContent = elem.textContent;
		drawTool.startDraw();
	});
});

const drawQuad = new DrawQuadrilateral(canvas, "tag");
var quad = document.getElementById("quad");
quad.addEventListener('click', function(o){
	drawQuad.startDraw();
});

btnEnd.addEventListener('click', function(o){
	drawTool.endDraw();

	drawQuad.endDraw();
});

var tabletask = document.getElementById("tabletask");
var selectPopup = document.getElementById("selectpopup");
var labelselect = document.getElementById("labelselect");

tabletask.addEventListener('contextmenu', function(ev) {
	ev.preventDefault();
	selectPopup.style['left'] = (ev.clientX+10)+"px";
	selectPopup.style['top'] = (ev.clientY-30)+"px";
	selectPopup.style["display"] = "";
	return false;
}, false);

Array.from(labelselect.children).forEach(function(elem) {
	elem.addEventListener('click', function(){
		drawTool.endDraw();
		label.textContent = elem.textContent;
		drawTool.startDraw();
	});
});

tabletask.addEventListener("click", (function(event) {
	selectPopup.style["display"] = "none";
}));


var hiddenAll = document.getElementById("hall");
var editAll = document.getElementById("eall");

hiddenAll.addEventListener('change', function(){
	AllCheckBoxHidden(canvas, hiddenAll.checked);
});

editAll.addEventListener('change', function(){
	AllCheckBoxEdit(canvas, editAll.checked);
});

//BONUS
//
//

var ws = document.getElementById("gooutmain_workspace");
var lo = document.getElementById("gooutmain_logout");

ws.addEventListener('click', function(){
	if(metaid){
		outWorkSpace(metaid.textContent, ws.formAction);
	}
	else {
		window.location.href = ws.formAction;
	}
});

lo.addEventListener('click', function(){
	if(metaid){
		outWorkSpace(metaid.textContent, lo.formAction);
	}
	else{
		window.location.href = lo.formAction;
	}
});

export {drawTool, canvas};