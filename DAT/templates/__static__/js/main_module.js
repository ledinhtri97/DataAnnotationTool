import React from 'react';
import ReactDOM from 'react-dom';

import {requestFaceAPI} from "./api/faceRequest";
import {requestPersonAPI} from "./api/personRequest";
import {outWorkSpace} from "./modules/dat-utils"
import {rqnext, rqsavenext, rqbadnext} from  "./controller/request"
import {initMaintask, renderBBS_RECT, renderBBS_POLY} from "./controller/renderInit"
import {init_event} from "./event/einit"
import {fabric} from 'fabric';
import {PopupControllers} from "./controller/popup";
import {DrawPolygon} from "./drawer/polygon"
import {Color} from "./style/color";
import DrawStatus from './drawstatus';
import QuickSettings from './settings'
import TemporaryDrawerSettings from "./materialui/drawerSettings";

const canvas = new fabric.Canvas('canvas', {
	hoverCursor: 'pointer',
	selection: true,
	selectionBorderColor: Color.GREEN,
	backgroundColor: null,
	uniScaleTransform: true,
});

//===================DEFAULT-INIT======================//
//

const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const predict_api = document.getElementById("predict_api");
const bad_data = document.getElementById("bad_data");
const skip_next = document.getElementById("skip_next");
const save_next = document.getElementById("save_next");
const stop_draw = document.getElementById("stop_draw");
const label_select = document.getElementById("label_select");
const stop_mode = document.getElementById("stop_mode");
const url_image = document.getElementById('url_image');
const selectPopup = document.getElementById("selectpopup");
const tabletask = document.getElementById("tabletask");

// var hiddenAll = document.getElementById("hall");
// var editAll = document.getElementById("eall");
// var deleteall = document.getElementById("deleteall");

const drawStatus = new DrawStatus();
const drawPoly = new DrawPolygon(canvas);
const popupControllers = new PopupControllers(canvas); 
const listPredict = []; 	
const quickSettings = new QuickSettings();

if(url_image){
	init_event(canvas, popupControllers);
	initMaintask(canvas, url_image.textContent);

	const settings = document.getElementById("settings");
	settings && ReactDOM.render(<TemporaryDrawerSettings canvas={canvas}/>, settings);
}

//=======================API===========================//

if (predict_api){
	predict_api.addEventListener('click', function(){
		var predict_bbs = document.getElementById("predict_bbs").textContent;
		var boxes_position = document.getElementById("boxes_position").textContent;
		var bbs = predict_bbs ? predict_bbs : boxes_position;
		try {
			if(listPredict.length == 0) {
				predict_api.style['display'] = 'none';
				
				bbs.split('\n').forEach(function(line){
					var info = line.split(',');
					if (info.length==5  || info.length==6){
						if(info.length == 5){
							info.unshift("1.0");
						}
						listPredict.push(renderBBS_RECT(canvas, info));	
					}
					else if (info.length==9 || info.length==10){
						if(info.length == 9){
							info.unshift("1.0");
						}
						listPredict.push(renderBBS_POLY(canvas, info));
					}
				});
			}

		} catch(e) {
			console.log(e);
		}
	});
}

//=====================CONTROLER=======================//
//

const controllerRequest = (callback_cl) => {
	listPredict.splice(0,listPredict.length);
	predict_api.style['display'] = '';	
	if(group_control) group_control.style["display"] = "none";
	if(callback_cl == 'rqbadnext'){
		rqbadnext(meta_id.textContent, canvas);
	}
	else if(callback_cl == 'rqnext'){
		rqnext(meta_id.textContent, canvas);
	}
	else if (callback_cl == 'rqsavenext') {
		rqsavenext(meta_id.textContent, canvas);
	}
}

if(bad_data){
	bad_data.addEventListener('click', function(){
		controllerRequest('rqbadnext');
	});
}

if(skip_next) {
	skip_next.addEventListener('click', function(){
		controllerRequest('rqnext');
	});
}

if(save_next) {
	save_next.addEventListener('click', function(){
		controllerRequest('rqsavenext');
	});
}

if(stop_draw){
	stop_draw.addEventListener('click', function(event){
		if(drawStatus.getIsDrawing()){
			document.getElementById("stop_mode").textContent = "Stop labeling mode";
			drawPoly.endDraw();
		}
		else{
			document.getElementById("stop_mode").textContent = "You are not in labeling mode";
		}
	}, false);
}

if(label_select) {

	const labels = JSON.parse(label_select.textContent)['labels'];
	labels.pop();
	labels.forEach(function(elem) {
		var spl = elem.id.split('-');
		var elemTool = document.getElementById(elem.id);
		if(elemTool){
			elemTool.addEventListener('click', (function(event) {
				drawPoly.setType(spl[1]);
				drawPoly.startDraw(spl[0]);
			}));
		}
	});
}


// if(att == 'size_icon'){
// 	canvas.getObjects().forEach(function(obj){
// 		if (obj.name_id == 'icon'){
// 			obj.set('radius', parseInt(val));
// 		}
// 	});
// 	canvas.renderAll();
// }
// else if (att == 'width_stroke'){
// 	canvas.getObjects().forEach(function(obj){
// 		if (obj.type == 'rect' || obj.type == 'polygon'){
// 			obj.set('strokeWidth', parseInt(val));
// 		}
// 	});
// 	canvas.renderAll();
// }

// if(tabletask){tabletask.addEventListener('contextmenu', function(ev) {
// 	ev.preventDefault();
// 	selectPopup.style['left'] = (ev.clientX+10)+"px";
// 	selectPopup.style['top'] = (ev.clientY-30)+"px";
// 	selectPopup.style["display"] = "";
// 	return false;
// 	}, false);
// }
// tabletask && tabletask.addEventListener("click", (function(event) {
// 	selectPopup.style["display"] = "none";
// }));

// hiddenAll && hiddenAll.addEventListener('change', function(){
// 	AllCheckBoxHidden(canvas, hiddenAll.checked);
// });

// editAll && editAll.addEventListener('change', function(){
// 	AllCheckBoxEdit(canvas, editAll.checked);
// });

// if (deleteall){
// 	deleteall.addEventListener('click', function(){
// 		DeleteAll(canvas);
// 	});
// }

export {canvas, quickSettings, drawStatus, drawPoly, listPredict, controllerRequest}