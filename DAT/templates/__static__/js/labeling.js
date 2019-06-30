import React from 'react';
import ReactDOM from 'react-dom';
import {fabric} from 'fabric';

import MainFrameLabeling from "./materialui/labeling-ui/mainframe";
import TemporaryDrawerInstruction from "./materialui/labeling-ui/drawerInstruction"
import TemporaryDrawerSettings from "./materialui/labeling-ui/drawerSettings";
import ToolListItems from './materialui/labeling-ui/listitem/toolListItems';

import {outWorkSpace} from "./modules/dat-utils";
import {rqnext, rqsavenext, rqsave} from  "./modules/request"
import {initCanvas, initPredict} from "./modules/labeling-module/renderInit"
import {init_event} from "./modules/labeling-module/event"
import {PopupControllers} from "./modules/labeling-module/controller/popup";
import {DrawTool} from "./modules/labeling-module/drawtool"
import {Color} from "./modules/labeling-module/style/color";
import DrawStatus from './modules/labeling-module/drawstatus';
import QuickSettings from './modules/labeling-module/settings'

document.addEventListener('contextmenu', event => event.preventDefault());

const controllerRequest = (callback_cl) => {

	if(group_control) group_control.style["display"] = "none";

	if(callback_cl == 'rqnext'){
		rqnext(meta_id.textContent, canvas);
	}
	if (callback_cl == 'rqsavenext') {
		rqsavenext(meta_id.textContent, canvas);
	}
	if (callback_cl == 'rqsave') {
		rqsave(meta_id.textContent, canvas);
	} 
}

const labeling = document.getElementById("labeling");
labeling && ReactDOM.render(<MainFrameLabeling />, labeling);

const canvas = new fabric.Canvas('canvas', {
	hoverCursor: 'pointer',
	selection: true,
	selectionBorderColor: Color.GREEN,
	backgroundColor: null,
	uniScaleTransform: true,
	fireRightClick: true,
});

const settings = document.getElementById("settings");
settings && ReactDOM.render(<TemporaryDrawerSettings canvas={canvas}/>, settings);

//===================DEFAULT-INIT======================//

const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const drawStatus = new DrawStatus();
const drawTool = new DrawTool(canvas);
const popupControllers = new PopupControllers(canvas); 
const quickSettings = new QuickSettings();

if(labeling && meta_id && meta_id.textContent){
	try {
		fetch('/gvlab-dat/workspace/metaview/'+meta_id.textContent+'/api-get-data/?label_select=true', {})
		.then(response => {
			if(response.status !== 200){
				return "FAILED";
			}
				return response.json();
			}
		).then(meta => {

			if(meta === "FAILED") return;

			initCanvas(canvas, meta);
			
			fetch('/gvlab-dat/workspace/api_reference/'+meta_id.textContent+'/api-get-data/', {})
			.then(response => {
				if(response.status !== 200){
					return "FAILED";
				}
					return response.json();
				}
			).then(meta => {
				if(meta === "FAILED") return;
				
				setTimeout(function(){initPredict(canvas, meta)}, 200);
			});

			init_event(canvas, popupControllers, meta.label_select);

			const tools_list_items = document.getElementById("tools_list_items");
			tools_list_items && ReactDOM.render(<ToolListItems 
				label_select={meta.label_select} 
				drawTool={drawTool} 
				drawStatus={drawStatus}
				quickSettings={quickSettings}
				controllerRequest={controllerRequest}/>, 
				tools_list_items);

			const keyboard = document.getElementById("keyboard");
			keyboard && ReactDOM.render(<TemporaryDrawerInstruction label_select={meta.label_select}/>, keyboard);

			//meta.label_select
			let label_select = document.getElementById('label_select');
			if(label_select) {
				label_select.textContent = JSON.stringify({label_select: meta.label_select});
			};

			//start drawing when all done
			//old option parameter: id, namelabel, typelabel
			
			document.getElementById("stop_draw").style['backgroundColor'] = "#B6F3F2";
			setTimeout(function(){drawTool.startDraw();}, 500);
		});
	} catch(e) {
		// statements
		console.log(e);
	}
}

//=====================CONTROLER=======================//

let only_save;
if(only_save){
	only_save.addEventListener('click', () => controllerRequest('rqsave'));
}

export {quickSettings, drawStatus, drawTool, controllerRequest}