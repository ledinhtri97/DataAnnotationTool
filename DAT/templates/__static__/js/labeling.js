import React from 'react';
import ReactDOM from 'react-dom';
import {fabric} from 'fabric';

import MainFrameLabeling from "./materialui/labeling-ui/mainframe";
import TemporaryDrawerInstruction from "./materialui/labeling-ui/drawerInstruction"
import TemporaryDrawerSettings from "./materialui/labeling-ui/drawerSettings";
import ToolListItems from './materialui/labeling-ui/listitem/toolListItems';

import rqnext from  "./modules/labeling-mod/request/next";
import rqsavenext from  "./modules/labeling-mod/request/saveNext";
import rqsave from  "./modules/labeling-mod/request/save";

import {initCanvas, initPredict} from "./modules/labeling-mod/renderInit"
import {init_event} from "./modules/labeling-mod/event"
import {PopupControllers} from "./modules/labeling-mod/controller/popup";
import {DrawTool} from "./modules/labeling-mod/drawtool";
import Color from "./modules/general-mod/style/color";
import DrawStatus from './modules/labeling-mod/drawstatus';
import QuickSettings from './modules/labeling-mod/settings';
import {autoOutWorkSpace, outWorkSpace} from './modules/general-mod/request/outWorking';
autoOutWorkSpace();

document.addEventListener('contextmenu', event => event.preventDefault());

const labeling = document.getElementById("labeling");
const on_edit = document.getElementById("on_edit");
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

const controllerRequest = (callback_cl) => {
	let isDrawing = drawStatus.getIsDrawing();
	if(callback_cl == 'rqnext'){
		drawStatus.resetDrawStatus();
		rqnext(meta_id.textContent, canvas);
	}
	else if (callback_cl == 'rqsavenext') {
		drawStatus.resetDrawStatus();
		rqsavenext(meta_id.textContent, canvas);
	}
	else if (callback_cl == 'rqsave') {
		drawStatus.resetDrawStatus();
		rqsave(meta_id.textContent, canvas);
	}
	if(isDrawing){
		drawTool.quickDraw();
	}
}

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
			
			if (!on_edit){
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
			}
			
			init_event(canvas, popupControllers);

			const tools_list_items = document.getElementById("tools_list_items");
        	const tracking = document.getElementById('tracking');

			(tools_list_items && !tracking) && ReactDOM.render(<ToolListItems
				canvas={canvas}
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
			
			let rectListLabel = [];
			let polyListLabel = [];
			meta.label_select.map(function(lb){
				let item_lb = {
					value: lb.tag_label,
					label: lb.tag_label,
					info: lb.tag_label+','+lb.type_label+','+lb.color,
				}
				if(lb.type_label === 'rect'){
					rectListLabel.push(item_lb);
				}
				else if (lb.type_label === 'poly') {
					polyListLabel.push(item_lb);
				}
			});
			drawStatus.setListLabel(rectListLabel, polyListLabel);
			
			if (!on_edit){
				document.getElementById("stop_draw").style['backgroundColor'] = "#B6F3F2";
				setTimeout(function(){drawTool.startDraw();}, 500);
			}

			document.getElementById("annotated_number").innerHTML = meta.annotated_number;
			
		});
	} catch(e) {
		// statements
		
		console.log(e);
	}
}

export {quickSettings, drawStatus, drawTool, controllerRequest, popupControllers}