import React from 'react';
import ReactDOM from 'react-dom';
import MedicalLabeling from "./materialui/labeling-ui/medical-labeling-main";
import {rqnext, rqsavenext} from  "./modules/request"

import MedicalLabelListItems from './materialui/labeling-ui/listitem/medicalLabelListItems';
import {fabric} from 'fabric';
import {Color} from "./modules/labeling-module/style/color";
import DrawStatus from './modules/labeling-module/drawstatus';
import QuickSettings from './modules/labeling-module/settings'
import {MedicalLabelState} from "./modules/labeling-module/drawer/medical_label"

//===================DEFAULT-INIT======================//
const group_control =  document.getElementById("group_control");
const meta_id = document.getElementById("meta_id");
const skip_next = document.getElementById("skip_next");
const save_next = document.getElementById("save_next");

const canvas = new fabric.Canvas('canvas', {
	hoverCursor: 'pointer',
	selection: true,
	selectionBorderColor: Color.GREEN,
	backgroundColor: null,
	uniScaleTransform: true,
});

const drawStatus = new DrawStatus();
const medical_label_state = new MedicalLabelState();
const quickSettings = new QuickSettings();
//===================RENDER LABELING UI======================//

const labeling = document.getElementById("labeling");
if (labeling) {
	const dataset_id = meta_id.textContent;
	fetch('http://172.28.182.108:8787/gvlab-dat/workspace/medical/instance/dataset/2/', {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	})
	.then(response => {
		return response.json();
	}).then(result => {
		var urls = [];
		var active_idx_views = [];
		
		/*for(let i in result) {
			const phase_name = result[i].phase_name;
			const instance_url = result[i].instance_url;
			urls.push(instance_url);
		}*/

		/*data = [
			"dicomweb://172.28.182.130/orthanc/instances/638355d5-1eff8f5a-fbe9c2c9-11d4ace7-86efaea2/file",
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
		]*/

		console.log("DEBUG BY ADDING CUSTOM DATA");
		urls.push([
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm"
		]);
		urls.push([
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm"
		]);
		active_idx_views.push(0);
		active_idx_views.push(0);

		console.log("urls");
		console.log(urls);

		ReactDOM.render(<MedicalLabeling 
			urls={urls} 
			active_idx_views={active_idx_views}
			medical_label_state={medical_label_state}/>, labeling);
	});

	fetch('/gvlab-dat/workspace/metaview/'+meta_id.textContent+'/api-get-data/?label_select=true', {})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
			return response.json();
		}
	).then(meta => {
		console.log("meta");
		console.log(meta);

		const labels_list_items = document.getElementById("labels_list_items");
		labels_list_items && ReactDOM.render(<MedicalLabelListItems 
			label_select={meta.label_select} 
			medical_label_state={medical_label_state} 
			drawStatus={drawStatus}
			quickSettings={quickSettings}/>, 
			labels_list_items);		
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