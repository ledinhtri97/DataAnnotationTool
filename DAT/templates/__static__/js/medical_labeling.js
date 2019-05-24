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
// import QuickSettings from './modules/labeling-module/settings'

//===================DEFAULT-INIT======================//
const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const skip_next = document.getElementById("skip_next");
const save_next = document.getElementById("save_next");
const drawStatus = new DrawStatus();
//const drawPoly = new DrawPolygon(canvas_arr[0]);
//const popupControllers = new PopupControllers(canvas_arr[0]); 
// const quickSettings = new QuickSettings();

//===================RENDER LABELING UI======================//

const labeling = document.getElementById("labeling");
if (labeling) {
	const dataset_id = meta_id.textContent;
	///////fetch('/gvlab-dat/workspace/medical/instance/dataset/'+dataset_id+'/', {})
	
	/*
	console.log("call XML Thanh");
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			console.log(this.responseText);
		}
	});
	xhr.open("GET", "http://172.28.182.130:8788/gvlab-dat/workspace/medical/instance/dataset/1/");
	//////xhr.send(data);
	xhr.send();
	console.log("Done!");	
	*/
	fetch('http://172.28.182.130:8788/gvlab-dat/workspace/medical/instance/dataset/1/', {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	})
	.then(response => {
		return response.json();
	}).then(result => {
		var data = [];
		for(let i in result) {
			const phase_name = result[i].phase_name;
			const instance_url = result[i].instance_url;
			data.push(instance_url);
		}

		/*data = [
			"dicomweb://172.28.182.130/orthanc/instances/638355d5-1eff8f5a-fbe9c2c9-11d4ace7-86efaea2/file",
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
		]*/

		console.log("DEBUG BY ADDING CUSTOM DATA");
		data.push("dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm");

		ReactDOM.render(<MedicalLabeling data={data}/>, labeling);
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