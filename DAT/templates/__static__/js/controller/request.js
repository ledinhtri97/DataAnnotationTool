import {initMaintask} from "./renderInit"
import ReactDOM from "react-dom";
import React, {Component} from "react";
import Cookie from 'js-cookie';
import {AllCheckBoxEdit} from "./itemReact";
import {reset_when_go} from "../event/einit";
import {outWorkSpace, ask_before_out} from "../modules/dat-utils"
import {drawPoly} from "../maintask"

var label = document.getElementById("label");

const nomoredata_handle =  function(){

	var url_workspace = document.getElementById("url_workspace").textContent;
	
	var meta_id = document.getElementById("meta_id");

	window.removeEventListener("beforeunload", ask_before_out);
	
	alert("Look like have no more data!!! return to workspace");
	
	outWorkSpace(meta_id.textContent, url_workspace);
}

const rqsavenext = function(meta_id, canvas){

	AllCheckBoxEdit(canvas, false);

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

			var bbs_available = document.getElementById("bbs_available");
			bbs_available.innerHTML = "";

			var bbs_hidden = document.getElementById("bbs_hidden");
			bbs_hidden.innerHTML = "";

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
			var bbs_available = document.getElementById("bbs_available");
			bbs_available.innerHTML = "";
			var bbs_hidden = document.getElementById("bbs_hidden");
			bbs_hidden.innerHTML = "";

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
			var bbs_available = document.getElementById("bbs_available");
			bbs_available.innerHTML = "";
			var bbs_hidden = document.getElementById("bbs_hidden");
			bbs_hidden.innerHTML = "";

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

export {rqsavenext, rqnext, rqbadnext};