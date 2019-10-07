var formSubmitting = false;
var setFormSubmitting = function() { formSubmitting = true; };

const ask_before_out = function (e) {
	if (formSubmitting) {
		return undefined;
	}
	var confirmationMessage = 'Có vẻ như bạn đang chỉnh sửa một số thứ. '
	+ 'Nếu bạn rời khỏi hay tải lại trang hiện tại trước khi lưu dữ liệu. Dữ liệu có thể sẽ mất';

	(e || window.event).returnValue = confirmationMessage; //Gecko + IE
	return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
};

const outWorkSpace = function(metaid, url){
	fetch("/gvlab-dat/workspace/outworkspace/"+metaid, {metaid: metaid})
	.then(response => {
		if(response.status !== 200){
			return "Out Workspace Failed";
		}
		return response.json();
	})
	.then(data => {
		window.removeEventListener("beforeunload", ask_before_out);
		window.location.href = url;
	});
}

const autoOutWorkSpace = function(){
	setTimeout(function(){
		var meta_id = document.getElementById("meta_id");
		var url_home = document.getElementById("url_home").textContent;
		if(meta_id){
			alert("You've working on 3 hours. You need to relax! The system will auto out of workspace.")
			outWorkSpace(meta_id.textContent, url_home);
		}
		else{
			window.location.href = url_home;
		}
	}, 10800000); //after 3 hours auto outworkspace; 
}

export {ask_before_out, outWorkSpace, autoOutWorkSpace};