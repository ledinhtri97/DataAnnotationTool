const rqnext = function(meta_id, canvas, drawTool, drawStatus){
	fetch("/gvlab-dat/workspace/next/"+meta_id+"/", {meta_id: meta_id})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
		return response.json();
	})
	.then(metadata => {
		if(!metadata.id){
			nomoredata_handle();
		}
		else{
			document.getElementById("meta_id").textContent = metadata.id;
			document.getElementById("label_list_items").innerHTML = "";

			canvas.clear();

			initCanvas(canvas, metadata);
			
			if(drawStatus.getNameLabel() != ''){
				reset_when_go();
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

	});
}

export rqnext;