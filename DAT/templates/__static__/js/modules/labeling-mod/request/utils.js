import {ask_before_out, outWorkSpace} from '../../general-mod/request/outWorking';

const collect_boudingbox = function(canvas){
	var myData = "";

	for(var i = 0; i < canvas.getObjects().length; i+=1){
		var item = canvas.item(i);
		if (item.islabel) {
			
			if (item.labelControl.getIsEdit()){
				item.labelControl.__editITEM__(false);
			}

			if (item.type == 'rect'){ 
				myData += [
				item.name,
				item.type_label,
				item.flag,
				item.xmin, item.ymin, item.xmax, item.ymax,
				].join(',') + '\n';
			}
			else if(item.type == 'polygon'){
				var bb = [item.name, item.type_label, item.flag];
				for (var p of item.rpoints){
					bb.push(p.x);
					bb.push(p.y);
				}
				myData += bb.join(',') + '\n';
			}
		}
	}

	return myData;
}

const nomoredata_handle =  function(){

	var url_workspace = document.getElementById("url_workspace").textContent;
	
	var meta_id = document.getElementById("meta_id");

	window.removeEventListener("beforeunload", ask_before_out);
	
	alert("Look like have no more data!!! return to workspace");
	
	outWorkSpace(meta_id.textContent, url_workspace);
}

export {collect_boudingbox, nomoredata_handle};