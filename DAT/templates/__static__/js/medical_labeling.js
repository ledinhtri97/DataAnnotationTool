import React from 'react';
import ReactDOM from 'react-dom';
import {fabric} from 'fabric';

import MedicalLabeling from "./materialui/labeling-ui/medical-labeling-main";
import TemporaryDrawerInstruction from "./materialui/labeling-ui/drawerInstruction"
//import TemporaryDrawerSettings from "./materialui/labeling-ui/drawerSettings";
import ToolListItems from './materialui/labeling-ui/listitem/toolListItems';

import {outWorkSpace} from "./modules/dat-utils";
import {rqnext, rqsavenext} from  "./modules/request"
import {initCanvas, initPredict} from "./modules/labeling-module/controller/renderInit"
import {init_event} from "./modules/labeling-module/event"
import {PopupControllers} from "./modules/labeling-module/controller/popup";
import {DrawPolygon} from "./modules/labeling-module/drawer/polygon"
import {Color} from "./modules/labeling-module/style/color";
import DrawStatus from './modules/labeling-module/drawstatus';
import QuickSettings from './modules/labeling-module/settings'

const labeling = document.getElementById("labeling");
labeling && ReactDOM.render(<MedicalLabeling />, labeling);

var canvas_arr = [];
const num_canvas = 4;
for(var c_idx=0; c_idx<num_canvas; c_idx++) {
    const canvas = new fabric.Canvas('canvas_'+c_idx.toString(), {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: Color.GREEN,
        backgroundColor: null,
        uniScaleTransform: true,
    });
    canvas_arr.push(canvas);
}

/*const settings = document.getElementById("settings");
settings && ReactDOM.render(<TemporaryDrawerSettings canvas={canvas}/>, settings);*/

//===================DEFAULT-INIT======================//

const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const skip_next = document.getElementById("skip_next");
const save_next = document.getElementById("save_next");
const drawStatus = new DrawStatus();
const drawPoly = new DrawPolygon(canvas_arr[0]);
const popupControllers = new PopupControllers(canvas_arr[0]); 
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

        for(var c_idx=0; c_idx<num_canvas; c_idx++) {
            initCanvas(canvas_arr[c_idx], meta);
        }
		
		fetch('/gvlab-dat/workspace/api_reference/'+meta_id.textContent+'/api-get-data/', {})
		.then(response => {
			if(response.status !== 200){
				return "FAILED";
			}
				return response.json();
			}
		).then(meta => {
		if(meta === "FAILED") return;
			setTimeout(function(){initPredict(canvas_arr[0], meta)}, 100);
		});

		init_event(canvas_arr[0], popupControllers, meta.label_select);

		const tools_list_items = document.getElementById("tools_list_items");
		tools_list_items && ReactDOM.render(<ToolListItems 
			label_select={meta.label_select} 
			drawPoly={drawPoly} 
			drawStatus={drawStatus}
			quickSettings={quickSettings}/>, 
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

//export {quickSettings, drawStatus, drawPoly, controllerRequest}