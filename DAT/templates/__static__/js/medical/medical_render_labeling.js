import React from 'react';
import ReactDOM from 'react-dom';
import {rqnext, rqsavenext} from  "../modules/request"
import {fabric} from 'fabric';
import {Color} from "../modules/labeling-module/style/color";
import DrawStatus from '../modules/labeling-module/drawstatus';
import QuickSettings from '../modules/labeling-module/settings'

import MedicalLabelingGrid from "./medical_labeling_grid";
import MedicalLabelList from './medical_label_list';
import {MedicalLabelState} from "./medical_label"

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
	//var backend_endpoint = '/gvlab-dat/workspace/medical/instance/dataset/' + dataset_id + '/';
	var backend_endpoint = '/medicalapi/instances/?datasetid=' + dataset_id;
	fetch(backend_endpoint, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	})
	.then(response => {
		return response.json();
	}).then(result => {
		var urls = [];
		var predicts = []; // an item in array looks like this: [{"label": "liver", "url": "http://172.28.182.144:8010/...jpg"}]
		var active_idx_views = [];
		var phase_names = [];
		
		console.log("result");
		console.log(result);

		if (typeof result.non_contrast_phase != "undefined") {
			var extracted_urls = [];
			var extracted_predicts = [];
			for (var k=0; k<result.non_contrast_phase.length; k++) {
				const slice_obj = result.non_contrast_phase[k];
				extracted_urls.push(slice_obj.url);
				if ('predicts' in slice_obj) {
					extracted_predicts.push(slice_obj.predicts);				
				} else {
					extracted_predicts.push(null);
				}
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Non Contrast");
			predicts.push(extracted_predicts);
		}

		if (typeof result.arterial_phase != "undefined") {
			var extracted_urls = [];
			var extracted_predicts = [];
			for (var k=0; k<result.arterial_phase.length; k++) {
				const slice_obj = result.arterial_phase[k];
				extracted_urls.push(slice_obj.url);
				if ('predicts' in slice_obj) {
					extracted_predicts.push(slice_obj.predicts);				
				} else {
					extracted_predicts.push(null);
				}
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Arterial");
			predicts.push(extracted_predicts);
		}

		if (typeof result.venous_phase != "undefined") {
			var extracted_urls = [];
			var extracted_predicts = [];
			for (var k=0; k<result.venous_phase.length; k++) {
				const slice_obj = result.venous_phase[k];
				extracted_urls.push(slice_obj.url);
				if ('predicts' in slice_obj) {
					extracted_predicts.push(slice_obj.predicts);				
				} else {
					extracted_predicts.push(null);
				}
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Venous");
			predicts.push(extracted_predicts);
		}

		if (typeof result.delay_phase != "undefined") {
			var extracted_urls = [];
			var extracted_predicts = [];
			for (var k=0; k<result.delay_phase.length; k++) {
				const slice_obj = result.delay_phase[k];
				extracted_urls.push(slice_obj.url);
				if ('predicts' in slice_obj) {
					extracted_predicts.push(slice_obj.predicts);				
				} else {
					extracted_predicts.push(null);
				}
			}
			urls.push(extracted_urls);
			active_idx_views.push(0);
			phase_names.push("Delay");
			predicts.push(extracted_predicts);
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

		console.log("predicts");
		console.log(predicts);

		ReactDOM.render(<MedicalLabelingGrid 
			urls={urls} 
			predicts={predicts}
			phase_names={phase_names}
			active_idx_views={active_idx_views}
			medical_label_state={medical_label_state}/>, labeling);
	});

	//fetch('/gvlab-dat/workspace/metaview/'+meta_id.textContent+'/api-get-data/?label_select=true', {})
	fetch('/medicalapi/labels/', {})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
			return response.json();
		}
	).then(meta => {
		console.log("meta");
		console.log(meta);

		var label_data = [];
		for (var mr=0; mr<meta.results.length; mr++) {
			var label_info_obj = meta.results[mr]; // {tag_label: "liver", type_label: "rect", description: null}
			label_data.push({
				id: mr+1,
				type_label: label_info_obj.type_label,
				tag_label: label_info_obj.tag_label,
				color: label_info_obj.color,
			});
		}

		const labels_list_items = document.getElementById("labels_list_items");
		labels_list_items && ReactDOM.render(<MedicalLabelList 
			label_select={label_data} 
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