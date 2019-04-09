import {initMaintask} from "./renderInit"
import ReactDOM from "react-dom";
import React, {Component} from "react";
import Cookie from 'js-cookie';
import {AllCheckBoxEdit} from "./itemReact";

const requestSaveAndNext = function(metaid, canvas){

	AllCheckBoxEdit(canvas, false);

	var myData = ""

	for(var i = 0; i < canvas.getObjects().length; i+=1){
		var item = canvas.item(i);
		// var item_html = document.getElementById("itembb_"+i);
		if (item.type = 'rect'){ 
			myData += [
			// item_html.firstElementChild.firstElementChild.textContent,
			item.name,
			item.left / canvas.getWidth(),
			item.top / canvas.getHeight(),
			item.width / canvas.getWidth(),
			item.height / canvas.getHeight()
			].join(',') + '\n';
		}
		else if(item.type = 'polygon'){
			// var bb = [item_html.firstElementChild.firstElementChild.textContent];
			var bb = [item.name];
			for (var p of item.points){
				bb.push(p.x / canvas.getWidth());
				bb.push(p.y / canvas.getHeight());
			}
			myData += bb.join(',') + '\n';
		}
	}
	// console.log(myData)

	fetch("/gvlab-dat/workspace/saveNnext/"+metaid+"/", {
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
		// console.log("Data is ok", metadata);

		document.getElementById("metaid").textContent = metadata.id;
		var bbs_available = document.getElementById("bbs_available");
		bbs_available.innerHTML = "";
		// ReactDOM.render(React.createElement("div", null, ""), bbs_available);
		var bbs_hidden = document.getElementById("bbs_hidden");
		bbs_hidden.innerHTML = "";
		// ReactDOM.render(React.createElement("div", null, ""), bbs_hidden);

		canvas.clear();

		var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name+'.'+metadata.extfile;
		initMaintask(canvas, url, metadata.boxes_position);

	}).catch(function(ex) {
		console.log("parsing failed", ex);
	});
}

export {requestSaveAndNext};