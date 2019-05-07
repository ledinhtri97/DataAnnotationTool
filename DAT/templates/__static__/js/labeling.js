import React from 'react';
import ReactDOM from 'react-dom';
import {fabric} from 'fabric';

import Labeling from "./materialui/labeling-ui/labeling-main";
import TemporaryDrawerInstruction from "./materialui/labeling-ui/drawerInstruction"
import TemporaryDrawerSettings from "./materialui/labeling-ui/drawerSettings";

import {outWorkSpace} from "./modules/dat-utils";

import {rqnext, rqsavenext} from  "./modules/request"
import {initMaintask, renderBBS_RECT, renderBBS_POLY} from "./modules/labeling-module/controller/renderInit"
import {init_event} from "./modules/labeling-module/event"
import {PopupControllers} from "./modules/labeling-module/controller/popup";
import {DrawPolygon} from "./modules/labeling-module/drawer/polygon"
import {Color} from "./modules/labeling-module/style/color";
import DrawStatus from './modules/labeling-module/drawstatus';
import QuickSettings from './modules/labeling-module/settings'

const labeling = document.getElementById("labeling");
labeling && ReactDOM.render(<Labeling />, labeling);


const keyboard = document.getElementById("keyboard");
keyboard && ReactDOM.render(<TemporaryDrawerInstruction />, keyboard);

const canvas = new fabric.Canvas('canvas', {
	hoverCursor: 'pointer',
	selection: true,
	selectionBorderColor: Color.GREEN,
	backgroundColor: null,
	uniScaleTransform: true,
});

const settings = document.getElementById("settings");
settings && ReactDOM.render(<TemporaryDrawerSettings canvas={canvas}/>, settings);



//===================DEFAULT-INIT======================//
//

const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const predict_api = document.getElementById("predict_api");
//const bad_data = document.getElementById("bad_data");
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

if(labeling){
	
	init_event(canvas, popupControllers);
	
	initMaintask(canvas, url_image.textContent);

	labeling.style['backgroundColor'] = (
			document.getElementById('color_background').textContent == 'true'
		) ? "#FFFFFF" : "#332F2F";
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
	// if(callback_cl == 'rqbadnext'){
	// 	rqbadnext(meta_id.textContent, canvas);
	// }
	if(callback_cl == 'rqnext'){
		rqnext(meta_id.textContent, canvas);
	}
	if (callback_cl == 'rqsavenext') {
		rqsavenext(meta_id.textContent, canvas);
	}
}

// if(bad_data){
// 	bad_data.addEventListener('click', function(){
// 		controllerRequest('rqbadnext');
// 	});
// }

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

export {canvas, quickSettings, drawStatus, drawPoly, listPredict, controllerRequest}