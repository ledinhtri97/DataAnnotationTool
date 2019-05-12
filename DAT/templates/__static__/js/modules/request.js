import {initCanvas, initPredict} from "./labeling-module/controller/renderInit";
import ReactDOM from "react-dom";
import React, {Component} from "react";
import Cookie from 'js-cookie';
import {reset_when_go} from "./labeling-module/event";
import {outWorkSpace, ask_before_out} from "./dat-utils"
import {drawPoly} from "../labeling"

var label = document.getElementById("label");
const ROUND = 100000;

const nomoredata_handle =  function(){

	var url_workspace = document.getElementById("url_workspace").textContent;
	
	var meta_id = document.getElementById("meta_id");

	window.removeEventListener("beforeunload", ask_before_out);
	
	alert("Look like have no more data!!! return to workspace");
	
	outWorkSpace(meta_id.textContent, url_workspace);
}

const rqsavenext = function(meta_id, canvas){

	var myData = ""

	for(var i = 0; i < canvas.getObjects().length; i+=1){
		var item = canvas.item(i);
		if (item.islabel) {
			if (item.type == 'rect'){ 
				myData += [
				item.name,
				item.type_label,
				item.flag,
				Math.round(item.left * ROUND / canvas.getWidth()) / ROUND,
				Math.round(item.top * ROUND / canvas.getHeight()) / ROUND,
				Math.round((item.left + item.width) * ROUND / canvas.getWidth()) / ROUND,
				Math.round((item.top + item.height) * ROUND / canvas.getHeight()) / ROUND,
				].join(',') + '\n';
			}
			else if(item.type == 'polygon'){
				var bb = [item.name, item.type_label, item.flag];
				for (var p of item.points){
					bb.push(Math.round(p.x * ROUND / canvas.getWidth()) / ROUND);
					bb.push(Math.round(p.y * ROUND / canvas.getHeight()) / ROUND);
				}
				myData += bb.join(',') + '\n';
			}
		}
	}

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
			
			if(label.textContent != "NO LABEL"){
				reset_when_go();
				drawPoly.startDraw();
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


const rqnext = function(meta_id, canvas){
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
			
			if(label.textContent!="NO LABEL"){
				reset_when_go();
				drawPoly.startDraw();
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

const rqsavesettings = function(){

	var myData = {
		'sett': {
			'show_popup': document.getElementById('show_popup').textContent,
			'auto_hidden': document.getElementById('auto_hidden').textContent,
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

export {rqsavenext, rqnext, rqsavesettings, rqacceptcontrib};