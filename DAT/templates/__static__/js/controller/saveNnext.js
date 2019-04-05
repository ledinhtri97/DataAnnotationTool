import {initMaintask} from "./renderInit"
import ReactDOM from "react-dom";
import React, {Component} from "react";
import Cookie from 'js-cookie';

const requestSaveAndNext = function(metaid, canvas){

	var myData = ""

	// var bbs_available = document.getElementById("bbs_available");

	for(var i = 0; i < canvas.getObjects().length; i+=1){
		var item_rect = canvas.item(i);
		var item_html = document.getElementById("itembb_"+i);

		myData += [
			item_html.firstElementChild.firstElementChild.textContent,
			item_rect.left / canvas.getWidth(),
			item_rect.top / canvas.getHeight(),
			item_rect.width / canvas.getWidth(),
			item_rect.height / canvas.getHeight()
		].join(',') + '\n';
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

		var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name;
		initMaintask(canvas, url, metadata.boxes_position);

	}).catch(function(ex) {
		console.log("parsing failed", ex);
	});
}

export {requestSaveAndNext};