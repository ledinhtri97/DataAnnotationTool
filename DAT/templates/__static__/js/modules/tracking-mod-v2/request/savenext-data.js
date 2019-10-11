import Cookie from 'js-cookie';
import {drawTool, drawStatus} from '../../../tracking';
import {initCanvas, initPredict} from '../renderInit';
import {collect_boudingbox} from './utils';

const rqsavenext = function(meta_id){

	if (drawTool.canvas.pos == '_full') {
		efs = document.getElementById('exit_full_screen');
		efs && efs.click();
	}

	var myData = collect_boudingbox(drawTool);
	//console.log(myData);

	fetch("/gvlab-dat/workspace/savenext/"+meta_id+"/", {
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
		if(!metadata.t){
			// nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.t.id;
			document.getElementById("label_list_items").innerHTML = "";
			drawStatus.resetLTM();

			let list_canvas = drawTool.getListCanvas()
			for (let pos in list_canvas){
				if (!pos) continue;
				let canvas = list_canvas[pos];
				let keep_bigplus = canvas.bigplus;
				canvas.clear();
				if (pos != '_full' ) {
					let rpos = pos.replace('_', ''); // ex: _tf => tf
					initCanvas(canvas, metadata[rpos]);
				}
				canvas.add(keep_bigplus[0]);
				canvas.add(keep_bigplus[1]);
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