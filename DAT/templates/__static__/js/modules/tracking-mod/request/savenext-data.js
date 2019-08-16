import {collect_boudingbox, nomoredata_handle} from './utils';

const rqsavenext = function(drawTool, drawStatus){

	var myData = collect_boudingbox(drawTool);
	console.log(myData);

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
			
			if(drawStatus.getNameLabel() != ''){
				drawTool.startDraw();
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

export rqsavenext;