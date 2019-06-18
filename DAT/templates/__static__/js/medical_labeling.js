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
import { type } from 'os';

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
	fetch('/gvlab-dat/workspace/medical/instance/dataset/' + dataset_id + '/', {
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
		var phase_names = [];
		
		console.log("result");
		console.log(result);

		if (typeof result.non_contrast_phase != "undefined") {
			var extracted_urls = [];
			for (var k=0; k<result.non_contrast_phase.length; k++) {
				const slice_obj = result.non_contrast_phase[k];
				extracted_urls.push(slice_obj.url);
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Non Contrast");
		}

		if (typeof result.arterial_phase != "undefined") {
			var extracted_urls = [];
			for (var k=0; k<result.arterial_phase.length; k++) {
				const slice_obj = result.arterial_phase[k];
				extracted_urls.push(slice_obj.url);
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Arterial");
		}

		if (typeof result.venous_phase != "undefined") {
			var extracted_urls = [];
			for (var k=0; k<result.venous_phase.length; k++) {
				const slice_obj = result.venous_phase[k];
				extracted_urls.push(slice_obj.url);
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Venous");
		}

		if (typeof result.delay_phase != "undefined") {
			var extracted_urls = [];
			for (var k=0; k<result.delay_phase.length; k++) {
				const slice_obj = result.delay_phase[k];
				extracted_urls.push(slice_obj.url);
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Delay");
		}
		
		/*
		console.log("DEBUG BY ADDING CUSTOM DATA");
		urls.push([
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm"
		]);
		urls.push([
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
			"dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm"
		]);*/

		console.log("urls");
		console.log(urls);

		console.log("phase_names");
		console.log(phase_names);

		ReactDOM.render(<MedicalLabeling 
			urls={urls} 
			phase_names={phase_names}
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
		console.log('/gvlab-dat/workspace/metaview/'+meta_id.textContent+'/api-get-data/?label_select=true');

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