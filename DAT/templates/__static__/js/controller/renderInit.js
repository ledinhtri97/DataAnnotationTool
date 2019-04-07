import {fabric} from 'fabric';
import {createItemToBoundingBoxes} from './itemReact';
import {configureRectangle} from '../drawer/rectangle';
function image_convert(img){
	var parent = document.getElementById("tabletask");

	var scale = Math.min( 
		parent.clientWidth / img.width, 
		parent.clientHeight / img.height 
		);
	return [img.width*scale, img.height*scale]
}

const initMaintask = function(canvas, url, bbs) {
	fabric.Image.fromURL(
		url,
		function(img) {
			var wh = image_convert(img)
			img.scaleToWidth(wh[0]);
			img.scaleToHeight(wh[1]);
			canvas.setWidth(wh[0]);
			canvas.setHeight(wh[1]);
			canvas.setBackgroundImage(img);
			canvas.renderAll();
			try {
				bbs.split('\n').forEach(function(line){
					var info = line.split(',');
					if (info.length>1){
						renderBBS(canvas,info[0],info[1],info[2],info[3],info[4]);	
					}
				});
			} catch(e) {
				console.log(e);
			}
		}
	);
};

const renderBBS = function(canvas, label, xmin, ymin, xmax, ymax){
	
	var rect = configureRectangle(
		xmin*canvas.getWidth(), 
		ymin*canvas.getHeight(), 
		xmax*canvas.getWidth(),
		ymax*canvas.getHeight());
	canvas.add(rect);
	canvas.renderAll();

	createItemToBoundingBoxes(canvas, label);
}

const outWorkSpace = function(metaid, url){
	fetch("/gvlab-dat/workspace/outworkspace/"+metaid, {metaid: metaid})
	.then(response => {
		if(response.status !== 200){
			return "Out Workspace Failed";
		}
		return response.json();
	})
	.then(data => {
		window.location.href = url;
	});
}

export {initMaintask, outWorkSpace}