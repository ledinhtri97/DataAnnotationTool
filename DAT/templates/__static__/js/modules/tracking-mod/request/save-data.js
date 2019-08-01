const rqsave = function(meta_id, canvas){

	var myData = collect_boudingbox(canvas);	

	fetch("/gvlab-dat/workspace/save/"+meta_id+"/", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: myData
	})
	.then(response => {
		if(response.status == 200){
			alert("Saved successfully");
		}
		else{
			alert("Save failed");
		}
	});
}

export rqsave;