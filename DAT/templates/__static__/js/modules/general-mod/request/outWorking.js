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

export {ask_before_out, outWorkSpace};