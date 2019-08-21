import Cookie from 'js-cookie';
import {drawTool, drawStatus} from '../../../labeling';
import {collect_boudingbox} from './utils';
import {initCanvas, initPredict} from '../renderInit';
import {reset_when_go} from '../event';

const rqsavenext = function(meta_id, canvas){

	var myData = collect_boudingbox(canvas);
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

		if(!metadata.id){
			//nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.id;
			document.getElementById("label_list_items").innerHTML = "";
			document.getElementById("annotated_number").innerHTML = metadata.annotated_number;
			
			let keep_bigplus = canvas.bigplus;
			canvas.clear();
			initCanvas(canvas, metadata);
			canvas.add(keep_bigplus[0]);
			canvas.add(keep_bigplus[1]);
			
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

export default rqsavenext;