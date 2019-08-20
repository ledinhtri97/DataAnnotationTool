
const collect_boudingbox = function(canvas){
	var myData = {data: []};

	for(var i = 0; i < canvas.getObjects().length; i+=1){
		var item = canvas.item(i);
		if (item.islabel) {
			
			if (item.labelControl.getIsEdit()){
				item.labelControl.__editITEM__(false);
			}

			if (item.type == 'rect'){ 
				myData.data.push({
						tag_label: item.name,
						type_label: item.type_label,
						flag: item.flag,
						position: [item.xmin, item.ymin, item.xmax, item.ymax].join(',')
				});

				// myData += [
				// item.name,
				// item.type_label,
				// item.flag,
				// item.xmin, item.ymin, item.xmax, item.ymax,
				// ].join(',') + '\n';
			}
			else if(item.type == 'polygon'){
				let position = [];
				for (var p of item.rpoints) {
					position.push(p.x);
					position.push(p.y);
				}
				myData.data.push({
					tag_label: item.name,
					type_label: item.type_label,
					flag: item.flag,
					position: position.join(',')
				});

				// var bb = [item.name, item.type_label, item.flag];
				// for (var p of item.rpoints){
				// 	bb.push(p.x);
				// 	bb.push(p.y);
				// }
				// myData += bb.join(',') + '\n';
			}
		}
	}

	return myData;
}

export {collect_boudingbox};