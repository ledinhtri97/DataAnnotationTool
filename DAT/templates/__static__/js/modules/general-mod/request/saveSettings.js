import Cookie from 'js-cookie';

const rqsavesettings = function(){

	var myData = {
		'sett': {
			'show_popup': document.getElementById('show_popup').textContent,
			'auto_hidden': document.getElementById('auto_hidden').textContent,
			'show_label': document.getElementById("show_label").textContent,
			'ask_dialog': document.getElementById('ask_dialog').textContent,
			'color_background': document.getElementById('color_background').textContent,
			'size_icon': document.getElementById('size_icon').textContent,
			'width_stroke': document.getElementById('width_stroke').textContent,
		},
	};

	fetch("/gvlab-dat/workspace/savesettings/", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"X-CSRFToken": Cookie.get("csrftoken"),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(myData),
	})
	.then(response => {
		if(response.status !== 200){
			return "FAILED";
		}
		return response.json();
	});
}

export default rqsavesettings;