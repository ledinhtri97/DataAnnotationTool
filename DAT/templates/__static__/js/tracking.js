import React from 'react';
import ReactDOM from 'react-dom';
import {fabric} from 'fabric';

import MainFrameTracking from "./materialui/tracking-ui/mainframe";
import TemporaryDrawerInstruction from "./materialui/tracking-ui/drawerInstruction"
import TemporaryDrawerSettings from "./materialui/tracking-ui/drawerSettings";
import ToolListItems from './materialui/tracking-ui/listitem/toolListItems';
import SynchControl from './materialui/tracking-ui/synch-control/SynchControl';

import {initCanvas, initPredict} from "./modules/tracking-mod/renderInit"
import {init_event} from "./modules/tracking-mod/event";
import PopupControllers from "./modules/tracking-mod/controller/popup";
import {DrawTool} from "./modules/tracking-mod/drawtool";
import Color from "./modules/general-mod/style/color";
import DrawStatus from './modules/tracking-mod/drawstatus';
import QuickSettings from './modules/tracking-mod/settings';

import rqsavenext from './modules/tracking-mod/request/savenext-data';
import rqsave from './modules/tracking-mod/request/save-data';
import {autoOutWorkSpace, outWorkSpace} from './modules/general-mod/request/outWorking';
autoOutWorkSpace();

document.addEventListener('contextmenu', event => event.preventDefault());

const labeling = document.getElementById("labeling");
const on_edit = document.getElementById("on_edit");

labeling && ReactDOM.render(<MainFrameTracking />, labeling);

const general_setting_canvas = (pos) => {
	return {
		hoverCursor: 'pointer',
		selection: true,
		selectionBorderColor: Color.GREEN,
		backgroundColor: null,
		uniScaleTransform: true,
		fireRightClick: true,
		pos: pos,
		zoomLevel: 0,
	}
}

const canvas_t = new fabric.Canvas('canvas_t', general_setting_canvas('_t'));
const canvas_b = new fabric.Canvas('canvas_b', general_setting_canvas('_b'));
const canvas_full = new fabric.Canvas('canvas_full', general_setting_canvas('_full'));

const canvas = {
	_t: canvas_t,
	_b: canvas_b,
	_full: canvas_full,
}

const settings = document.getElementById("settings");
settings && ReactDOM.render(<TemporaryDrawerSettings canvas={canvas}/>, settings);

// const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const drawStatus = new DrawStatus();
const drawTool = new DrawTool(canvas);
const popupControllers = new PopupControllers();
const quickSettings = new QuickSettings();

const controllerRequest = (callback_cl) => {
	let isDrawing = drawStatus.getIsDrawing();
	if (callback_cl == 'rqsavenext') {
		drawStatus.resetDrawStatus();
		rqsavenext(meta_id.textContent);
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
		fetch('/gvlab-dat/workspace/listmetaview/'+meta_id.textContent+'/api-get-data/?label_select=true', {})
		.then(response => {
			if(response.status !== 200){
				return "FAILED";
			}
				return response.json();
			}
		).then(data => {

			if(data === "FAILED") return;

			initCanvas(canvas_t, data.t);
			initCanvas(canvas_b, data.b);

			// if (!on_edit){
			// 	fetch('/gvlab-dat/workspace/api_reference/'+meta_id.textContent+'/api-get-data/', {})
			// 	.then(response => {
			// 		if(response.status !== 200){
			// 			return "FAILED";
			// 		}
			// 			return response.json();
			// 		}
			// 	).then(data => {
			// 		if(data === "FAILED") return;	
			// 		setTimeout(function(){initPredict(canvas, data)}, 200);
			// 	});
			// }
			
			init_event(canvas_t);
			init_event(canvas_b);
			init_event(canvas_full);

			const tools_list_items = document.getElementById("tools_list_items");
			tools_list_items && ReactDOM.render(<ToolListItems
				drawTool={drawTool} 
				drawStatus={drawStatus}
				quickSettings={quickSettings}
				controllerRequest={controllerRequest}/>, 
				tools_list_items);

			const keyboard = document.getElementById("keyboard");
			keyboard && ReactDOM.render(<TemporaryDrawerInstruction label_select={data.label_select}/>, keyboard);

			//data.label_select
			let label_select = document.getElementById('label_select');
			if(label_select) {
				label_select.textContent = JSON.stringify({label_select: data.label_select});
			};
			
			let rectListLabel = [];
			let polyListLabel = [];
			data.label_select.map(function(lb){
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
			
			// if (!on_edit){
			// 	document.getElementById("stop_draw").style['backgroundColor'] = "#B6F3F2";
			// 	// setTimeout(function(){drawTool.startDraw();}, 500);
			// 	drawStatus.startDrawStatus();
			// }

			const synch_t = document.getElementById("synch_t");
			const synch_b = document.getElementById("synch_b");
			const synch_full = document.getElementById("synch_full");

			synch_t && ReactDOM.render(<SynchControl 
				drawStatus={drawStatus} drawTool={drawTool} idframe={'_t'} />, synch_t);
			synch_b && ReactDOM.render(<SynchControl 
				drawStatus={drawStatus} drawTool={drawTool} idframe={'_b'} />, synch_b);
			synch_full && ReactDOM.render(<SynchControl 
				drawStatus={drawStatus} drawTool={drawTool} idframe={'_full'} />, synch_full);
		});

		document.getElementById("labeling").style['backgroundColor'] = "#1B1616";

	} catch(e) {
		// statements
		
		console.log(e);
	}
}

export {quickSettings, drawStatus, drawTool, controllerRequest, popupControllers}