import {initMaintask} from "./renderInit"
import ReactDOM from "react-dom";
import React, {Component} from "react";
import Cookie from 'js-cookie';
import {AllCheckBoxEdit} from "./itemReact";
import {ask_before_out, reset_when_go} from "../event/einit";
import {drawPoly} from "../maintask"

var label = document.getElementById("label");

const nomoredata_handle =  function(){

	var ws = document.getElementById("gooutmain_workspace");
	
	var metaid = document.getElementById("metaid");

	window.removeEventListener("beforeunload", ask_before_out);
	
	alert("Look like have no more data!!! return to workspace");
	
	outWorkSpace(metaid.textContent, ws.formAction);
}

const outWorkSpace = function(metaid, url){
	fetch("/gvlab-dat/workspace/outworkspace/"+metaid, {metaid: metaid})
	.then(response => {
		if(response.status !== 200){
			return "Out Workspace Failed";
		}
		return response.json();
	})
	.then(data => {
		window.removeEventListener("beforeunload", ask_before_out);
		window.location.href = url;
	});
}


const rqsavenext = function(metaid, canvas){

	AllCheckBoxEdit(canvas, false);

	var myData = ""

	for(var i = 0; i < canvas.getObjects().length; i+=1){
		var item = canvas.item(i);
		// var item_html = document.getElementById("itembb_"+i);
		if (item.type = 'rect'){ 
			myData += [
			item.name,
			item.left / canvas.getWidth(),
			item.top / canvas.getHeight(),
			item.width / canvas.getWidth(),
			item.height / canvas.getHeight()
			].join(',') + '\n';
		}
		else if(item.type = 'polygon'){
			var bb = [item.name];
			for (var p of item.points){
				bb.push(p.x / canvas.getWidth());
				bb.push(p.y / canvas.getHeight());
			}
			myData += bb.join(',') + '\n';
		}
	}
	// console.log(myData)

	fetch("/gvlab-dat/workspace/savenext/"+metaid+"/", {
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
			document.getElementById("metaid").textContent = metadata.id;
			var bbs_available = document.getElementById("bbs_available");
			bbs_available.innerHTML = "";

			var bbs_hidden = document.getElementById("bbs_hidden");
			bbs_hidden.innerHTML = "";

			canvas.clear();

			var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name+'.'+metadata.extfile;
			initMaintask(canvas, url, metadata.boxes_position);
			document.getElementById("bbsfirst").textContent = metadata.boxes_position;

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


const rqnext = function(metaid, canvas){
	fetch("/gvlab-dat/workspace/next/"+metaid+"/", {metaid: metaid})
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
			document.getElementById("metaid").textContent = metadata.id;
			var bbs_available = document.getElementById("bbs_available");
			bbs_available.innerHTML = "";
			var bbs_hidden = document.getElementById("bbs_hidden");
			bbs_hidden.innerHTML = "";

			canvas.clear();

			var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name+'.'+metadata.extfile;
			initMaintask(canvas, url, metadata.boxes_position);
			document.getElementById("bbsfirst").textContent = metadata.boxes_position;

			if(label.textContent!="NO LABEL"){
				var lb = label.textContent;
				reset_when_go();
				drawPoly.startDraw(lb);
			}

		}

	});
}


const rqbadnext = function(metaid, canvas){
	fetch("/gvlab-dat/workspace/badnext/"+metaid+"/", {metaid: metaid})
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
			document.getElementById("metaid").textContent = metadata.id;
			var bbs_available = document.getElementById("bbs_available");
			bbs_available.innerHTML = "";
			var bbs_hidden = document.getElementById("bbs_hidden");
			bbs_hidden.innerHTML = "";

			canvas.clear();

			var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name+'.'+metadata.extfile;
			initMaintask(canvas, url, metadata.boxes_position);
			document.getElementById("bbsfirst").textContent = metadata.boxes_position;

			if(label.textContent!="NO LABEL"){
				var lb = label.textContent;
				reset_when_go();
				drawPoly.startDraw(lb);
			}
			
		}
	});
}

export {outWorkSpace, rqsavenext, rqnext, rqbadnext};