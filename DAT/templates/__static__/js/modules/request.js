import {initMaintask} from "./labeling-module/controller/renderInit";
import ReactDOM from "react-dom";
import React, {Component} from "react";
import Cookie from 'js-cookie';
import {reset_when_go} from "./labeling-module/event";
import {outWorkSpace, ask_before_out} from "./dat-utils"
import {drawPoly} from "../labeling"

var label = document.getElementById("label");

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
		// var item_html = document.getElementById("itembb_"+i);
		if (item.type == 'rect'){ 
			myData += [
			item.name,
			item.left / canvas.getWidth(),
			item.top / canvas.getHeight(),
			(item.left + item.width) / canvas.getWidth(),
			(item.top + item.height) / canvas.getHeight()
			].join(',') + '\n';
		}
		else if(item.type == 'polygon'){
			var bb = [item.name];
			for (var p of item.points){
				bb.push(p.x / canvas.getWidth());
				bb.push(p.y / canvas.getHeight());
			}
			myData += bb.join(',') + '\n';
		}
	}
	// console.log(myData)

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
			document.getElementById("predict_bbs").textContent = metadata.predict_bbs;
			document.getElementById("label_list_items").innerHTML = "";

			canvas.clear();

			var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name+'.'+metadata.extfile;
			initMaintask(canvas, url, metadata.boxes_position);
			// document.getElementById("bbsfirst").textContent = metadata.boxes_position;

			if(label.textContent!="NO LABEL"){
				var lb = label.textContent;
				reset_when_go();
				drawPoly.startDraw(lb);
			}

		}
	}).catch(function(ex) {
		console.log("parsing failed", ex);
	});
}


const rqnext = function(meta_id, canvas){
	fetch("/gvlab-dat/workspace/next/"+meta_id+"/", {meta_id: meta_id})
	.then(response => {
		if(response.status !== 200){
			return "Something went wrong";
		}
		return response.json();
	})
	.then(metadata => {
		if(!metadata.id){
			nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.id;
			document.getElementById("predict_bbs").textContent = metadata.predict_bbs;
			document.getElementById("label_list_items").innerHTML = "";

			canvas.clear();

			var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name+'.'+metadata.extfile;
			initMaintask(canvas, url, metadata.boxes_position);
			// document.getElementById("bbsfirst").textContent = metadata.boxes_position;

			if(label.textContent!="NO LABEL"){
				var lb = label.textContent;
				reset_when_go();
				drawPoly.startDraw(lb);
			}

		}

	});
}


const rqbadnext = function(meta_id, canvas){
	fetch("/gvlab-dat/workspace/badnext/"+meta_id+"/", {meta_id: meta_id})
	.then(response => {
		if(response.status !== 200){
			return "Something went wrong";
		}
		return response.json();
	})
	.then(metadata => {
		if(!metadata.id){
			nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.id;
			document.getElementById("predict_bbs").textContent = metadata.predict_bbs;
			document.getElementById("label_list_items").innerHTML = "";

			canvas.clear();

			var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name+'.'+metadata.extfile;
			initMaintask(canvas, url, metadata.boxes_position);
			// document.getElementById("bbsfirst").textContent = metadata.boxes_position;

			if(label.textContent!="NO LABEL"){
				var lb = label.textContent;
				reset_when_go();
				drawPoly.startDraw(lb);
			}
			
		}
	});
}


const rqsavesettings = function(){

	var myData = {
		'sett': {
			'show_popup': document.getElementById('show_popup').textContent,
			'auto_hidden': document.getElementById('auto_hidden').textContent,
			'auto_predict': document.getElementById('auto_predict').textContent,
			'ask_dialog': document.getElementById('ask_dialog').textContent,
			'color_background': document.getElementById('color_background').textContent,
			'size_icon': document.getElementById('size_icon').textContent,
			'width_stroke': document.getElementById('width_stroke').textContent,
		},
		'data_id': document.getElementById("data_id").textContent,
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
			return "Something went wrong";
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
			return "Something went wrong";
		}
		window.location.href = contribute_url;
	});
}

export {rqsavenext, rqnext, rqbadnext, rqsavesettings, rqacceptcontrib};