import {initCanvas, initPredict} from "./tracking-module/renderInit";
import ReactDOM from "react-dom";
import React, {Component} from "react";
import Cookie from 'js-cookie';
import {reset_when_go} from "./tracking-module/event";
import {outWorkSpace, ask_before_out} from "./dat-utils";

const ROUND = 100000;

const collect_boudingbox = function(canvas){
	var myData = "";

	for(var i = 0; i < canvas.getObjects().length; i+=1){
		var item = canvas.item(i);
		if (item.islabel) {
			
			if (item.labelControl.getIsEdit()){
				item.labelControl.__editITEM__(false);
			}

			if (item.type == 'rect'){ 
				myData += [
				item.name,
				item.type_label,
				item.flag,
				item.xmin, item.ymin, item.xmax, item.ymax,
				// Math.round(item.left * ROUND / canvas.originWidth) / ROUND,
				// Math.round(item.top * ROUND / canvas.originHeight) / ROUND,
				// Math.round((item.left + item.width) * ROUND / canvas.originWidth) / ROUND,
				// Math.round((item.top + item.height) * ROUND / canvas.originHeight) / ROUND,
				].join(',') + '\n';
			}
			else if(item.type == 'polygon'){
				var bb = [item.name, item.type_label, item.flag];
				for (var p of item.rpoints){
					bb.push(p.x);
					bb.push(p.y);
					// bb.push(Math.round(p.x * ROUND / canvas.originWidth) / ROUND);
					// bb.push(Math.round(p.y * ROUND / canvas.originHeight) / ROUND);
				}
				myData += bb.join(',') + '\n';
			}
		}
	}

	return myData;
}

const nomoredata_handle =  function(){

	var url_workspace = document.getElementById("url_workspace").textContent;
	
	var meta_id = document.getElementById("meta_id");

	window.removeEventListener("beforeunload", ask_before_out);
	
	alert("Look like have no more data!!! return to workspace");
	
	outWorkSpace(meta_id.textContent, url_workspace);
}

const rqsavenext = function(meta_id, canvas, drawTool, drawStatus){

	var myData = collect_boudingbox(canvas);	

	fetch("/gvlab-dat/workspace/savenext/"+meta_id+"/", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: myData
	}).then(function(response) {
		return response.json();
	}).then(function(metadata) {

		if(!metadata.id){
			nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.id;
			document.getElementById("label_list_items").innerHTML = "";

			canvas.clear();

			initCanvas(canvas, metadata);
			
			if(drawStatus.getNameLabel() != ''){
				reset_when_go();
				drawTool.startDraw();
			}
			
			fetch('/gvlab-dat/workspace/api_reference/'+metadata.id+'/api-get-data/', {})
			.then(response => {
				if(response.status !== 200){
					return "FAILED";
				}
					return response.json();
				}
			).then(meta => {
			if(meta === "FAILED") return;
				initPredict(canvas, meta);
			});

		}
	}).catch(function(ex) {
		console.log("parsing failed", ex);
	});
}


const rqnext = function(meta_id, canvas, drawTool, drawStatus){
	fetch("/gvlab-dat/workspace/next/"+meta_id+"/", {meta_id: meta_id})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
		return response.json();
	})
	.then(metadata => {
		if(!metadata.id){
			nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.id;
			document.getElementById("label_list_items").innerHTML = "";

			canvas.clear();

			initCanvas(canvas, metadata);
			
			if(drawStatus.getNameLabel() != ''){
				reset_when_go();
				drawTool.startDraw();
			}

			fetch('/gvlab-dat/workspace/api_reference/'+metadata.id+'/api-get-data/', {})
			.then(response => {
				if(response.status !== 200){
					return "FAILED";
				}
					return response.json();
				}
			).then(meta => {
			if(meta === "FAILED") return;
				initPredict(canvas, meta);
			});

		}

	});
}

const rqsave = function(meta_id, canvas){

	var myData = collect_boudingbox(canvas);	

	fetch("/gvlab-dat/workspace/save/"+meta_id+"/", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: myData
	})
	.then(response => {
		if(response.status == 200){
			alert("Saved successfully");
		}
		else{
			alert("Save failed");
		}
	});
}

const rqsavesettings = function(){

	var myData = {
		'sett': {
			'show_popup': document.getElementById('show_popup').textContent,
			'auto_hidden': document.getElementById('auto_hidden').textContent,
			'show_label': document.getElementById("show_label").textContent,
			'ask_dialog': document.getElementById('ask_dialog').textContent,
			'color_background': document.getElementById('color_background').textContent,
			'size_icon': document.getElementById('size_icon').textContent,
			'width_stroke': document.getElementById('width_stroke').textContent,
		},
	};

	fetch("/gvlab-dat/workspace/savesettings/", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(myData),
	})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
		return response.json();
	});
}

const rqacceptcontrib = function(accept_url, contribute_url){
	fetch(accept_url, {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
	})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
		window.location.href = contribute_url;
	});
}

export {rqsave, rqsavenext, rqnext, rqsavesettings, rqacceptcontrib};