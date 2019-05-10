import React from 'react';
import ReactDOM from 'react-dom';
import {fabric} from 'fabric';

import Labeling from "./materialui/labeling-ui/labeling-main";
import TemporaryDrawerInstruction from "./materialui/labeling-ui/drawerInstruction"
import TemporaryDrawerSettings from "./materialui/labeling-ui/drawerSettings";
import ToolListItems from './materialui/labeling-ui/listitem/toolListItems';

import {outWorkSpace} from "./modules/dat-utils";
import {rqnext, rqsavenext} from  "./modules/request"
import {initMaintask} from "./modules/labeling-module/controller/renderInit"
import {init_event} from "./modules/labeling-module/event"
import {PopupControllers} from "./modules/labeling-module/controller/popup";
import {DrawPolygon} from "./modules/labeling-module/drawer/polygon"
import {Color} from "./modules/labeling-module/style/color";
import DrawStatus from './modules/labeling-module/drawstatus';
import QuickSettings from './modules/labeling-module/settings'

const labeling = document.getElementById("labeling");
labeling && ReactDOM.render(<Labeling />, labeling);

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

const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const skip_next = document.getElementById("skip_next");
const save_next = document.getElementById("save_next");
const stop_draw = document.getElementById("stop_draw");
const stop_mode = document.getElementById("stop_mode");
const drawStatus = new DrawStatus();
const drawPoly = new DrawPolygon(canvas);
const popupControllers = new PopupControllers(canvas); 
const quickSettings = new QuickSettings();

if(labeling){

	fetch('/gvlab-dat/workspace/metaview/'+meta_id.textContent+'/api-get-data/?label_select=true', {})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
			return response.json();
		}
	).then(meta => {

		if(meta === "FAILED") return;

		initMaintask(canvas, meta);
		init_event(canvas, popupControllers, meta.label_select);

		const tools_list_items = document.getElementById("tools_list_items");
		tools_list_items && ReactDOM.render(<ToolListItems label_select={meta.label_select} drawPoly={drawPoly}/>, 
			tools_list_items);

		const keyboard = document.getElementById("keyboard");
		keyboard && ReactDOM.render(<TemporaryDrawerInstruction label_select={meta.label_select}/>, keyboard);

	});
}

//=====================CONTROLER=======================//

const controllerRequest = (callback_cl) => {

	if(group_control) group_control.style["display"] = "none";

	if(callback_cl == 'rqnext'){
		rqnext(meta_id.textContent, canvas);
	}
	if (callback_cl == 'rqsavenext') {
		rqsavenext(meta_id.textContent, canvas);
	}
}

if(skip_next) {
	skip_next.addEventListener('click', () => controllerRequest('rqnext'));
}

if(save_next) {
	save_next.addEventListener('click', () => controllerRequest('rqsavenext'));
}

if(stop_draw){
	stop_draw.addEventListener('click', (event) => {
		if(drawStatus.getIsDrawing()){
			document.getElementById("stop_mode").textContent = "Stop labeling mode";
			drawPoly.endDraw();
		}
		else{
			document.getElementById("stop_mode").textContent = "You are not in labeling mode";
		}
	}, false);
}

export {quickSettings, drawStatus, drawPoly, controllerRequest}