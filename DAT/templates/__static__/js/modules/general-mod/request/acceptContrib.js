const rqacceptcontrib = function(accept_url, contribute_url){
	fetch(accept_url, {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
	})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
		window.location.href = contribute_url;
	});
}

export default rqacceptcontrib;