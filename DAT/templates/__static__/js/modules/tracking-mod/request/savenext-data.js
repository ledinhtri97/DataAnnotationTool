import Cookie from 'js-cookie';
import {drawTool, drawStatus} from '../../../tracking';
import {initCanvas, initPredict} from '../renderInit';
import {collect_boudingbox} from './utils';

const rqsavenext = function(meta_id){

	var myData = collect_boudingbox(drawTool);
	console.log(myData);

	fetch("/gvlab-dat/workspace/savenext_v2/"+meta_id+"/", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(myData)
	}).then(function(response) {
		return response.json();
	}).then(function(metadata) {
		if(!metadata.tl){
			// nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.tl.id;
			document.getElementById("label_list_items").innerHTML = "";

			let list_canvas = drawTool.getListCanvas()
			for (let pos in list_canvas){
				let canvas = list_canvas[pos];
				canvas.clear();
				let rpos = pos.replace('_', '')
				initCanvas(canvas, metadata[rpos]);
			}
			
			if(drawStatus.getNameLabel() != ''){
				drawTool.startDraw();
			}
			
			// fetch('/gvlab-dat/workspace/api_reference/'+metadata.id+'/api-get-data/', {})
			// .then(response => {
			// 	if(response.status !== 200){
			// 		return "FAILED";
			// 	}
			// 		return response.json();
			// 	}
			// ).then(meta => {
			// if(meta === "FAILED") return;
			// 	initPredict(canvas, meta);
			// });

		}
	}).catch(function(ex) {
		console.log("parsing failed", ex);
	});
}

export default rqsavenext;