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
import {Color} from "./modules/tracking-mod/style/color";
import DrawStatus from './modules/tracking-mod/drawstatus';
import QuickSettings from './modules/tracking-mod/settings';

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

const canvas_tl = new fabric.Canvas('canvas_tl', general_setting_canvas('_tl'));
const canvas_tr = new fabric.Canvas('canvas_tr', general_setting_canvas('_tr'));
const canvas_bl = new fabric.Canvas('canvas_bl', general_setting_canvas('_bl'));
const canvas_br = new fabric.Canvas('canvas_br', general_setting_canvas('_br'));
const canvas_full = new fabric.Canvas('canvas_full', general_setting_canvas('_full'));

const canvas = {
	_tl: canvas_tl,
	_tr: canvas_tr,
	_bl: canvas_bl,
	_br: canvas_br,
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

	// if(group_control) group_control.style["display"] = "none";

	// if(callback_cl == 'rqnext'){
	// 	drawStatus.resetDrawStatus();
	// 	rqnext(meta_id.textContent, canvas, drawTool, drawStatus);
		
	// }
	// if (callback_cl == 'rqsavenext') {
	// 	drawStatus.resetDrawStatus();
	// 	rqsavenext(meta_id.textContent, canvas, drawTool, drawStatus);
	// }
	// if (callback_cl == 'rqsave') {
	// 	drawStatus.resetDrawStatus();
	// 	rqsave(meta_id.textContent, canvas);
	// }
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

			initCanvas(canvas_tl, data.tl);
			initCanvas(canvas_tr, data.tr);
			initCanvas(canvas_bl, data.bl);
			initCanvas(canvas_br, data.br);



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
			
			init_event(canvas_tl);
			init_event(canvas_tr);
			init_event(canvas_bl);
			init_event(canvas_br);

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

			const synch_tl = document.getElementById("synch_tl");
			const synch_tr = document.getElementById("synch_tr");
			const synch_bl = document.getElementById("synch_bl");
			const synch_br = document.getElementById("synch_br");
			const synch_full = document.getElementById("synch_full");

			synch_tl && ReactDOM.render(<SynchControl 
				drawStatus={drawStatus} drawTool={drawTool} idframe={'_tl'} />, synch_tl);
			synch_tr && ReactDOM.render(<SynchControl 
				drawStatus={drawStatus} drawTool={drawTool} idframe={'_tr'} />, synch_tr);
			synch_bl && ReactDOM.render(<SynchControl 
				drawStatus={drawStatus} drawTool={drawTool} idframe={'_bl'} />, synch_bl);
			synch_br && ReactDOM.render(<SynchControl 
				drawStatus={drawStatus} drawTool={drawTool} idframe={'_br'} />, synch_br);
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