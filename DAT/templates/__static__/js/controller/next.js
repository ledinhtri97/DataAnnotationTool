import {initMaintask} from "./renderInit"
import ReactDOM from "react-dom";
import React, {Component} from "react";

const requestNextMetaData = function(metaid, canvas){
	fetch("/gvlab-dat/workspace/next/"+metaid+"/", {metaid: metaid})
	.then(response => {
		if(response.status !== 200){
			return "Something went wrong";
		}
		return response.json();
	})
	.then(metadata => {
		document.getElementById("metaid").textContent = metadata.id;
		var bbs_available = document.getElementById("bbs_available");
		bbs_available.innerHTML = "";
		// ReactDOM.render("", bbs_available);
		var bbs_hidden = document.getElementById("bbs_hidden");
		bbs_hidden.innerHTML = "";
		// ReactDOM.render("", bbs_hidden);

		canvas.clear();

		var url = "/gvlab-dat/dataset/"+metadata.full_path+"/"+metadata.name;
		initMaintask(canvas, url, metadata.boxes_position);

	});
}

export {requestNextMetaData};