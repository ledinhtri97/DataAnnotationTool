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

const collect_boudingbox = function(drawTool){
	let resData = {};
	let list_canvas = drawTool.getListCanvas()
	for (let pos in list_canvas){
		
		if (pos == '_full' || !pos) continue;

		let canvas = list_canvas[pos];

		let myData = [];

		for(var i = 0; i < canvas.getObjects().length; i+=1){
			var item = canvas.item(i);
			if (item.islabel) {
				
				if (item.labelControl.getIsEdit()){
					item.labelControl.__editITEM__(false);
				}

				if (item.type == 'rect'){
					myData.push({
						tag_label: item.name,
						from_id: item.labelControl.getFromId(),
						to_id: item.labelControl.getPosId(),
						type_label: item.type_label,
						flag: item.flag,
						position: [item.xmin, item.ymin, item.xmax, item.ymax].join(',')
					});
				}
				else if(item.type == 'polygon'){
					let position = [];
					for (var p of item.rpoints) {
						position.push(p.x);
						position.push(p.y);
					}
					myData.push({
						tag_label: item.name,
						from_id: item.labelControl.getFromId(),
						to_id: item.labelControl.getPosId(),
						type_label: item.type_label,
						flag: item.flag,
						position: position.join(',')
					});
				}
			}
		}
		resData[canvas.id_meta] = myData;
	}

	return resData;
}

const nomoredata_handle =  function(){

	var url_workspace = document.getElementById("url_workspace").textContent;
	
	var meta_id = document.getElementById("meta_id");

	window.removeEventListener("beforeunload", ask_before_out);
	
	alert("Look like have no more data!!! return to workspace");
	
	outWorkSpace(meta_id.textContent, url_workspace);
}

export {collect_boudingbox, nomoredata_handle, ask_before_out, outWorkSpace};