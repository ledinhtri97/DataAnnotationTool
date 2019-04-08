import {fabric} from 'fabric';
import {createItemToBoundingBoxes} from './itemReact';
import {configureRectangle} from '../drawer/rectangle';
import {configurePoly} from '../drawer/polygon';

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
					if (info.length==5){
						renderBBS_RECT(canvas, info);	
					}
					else if (info.length==9){
						renderBBS_POLY(canvas, info);
					}
				});
			} catch(e) {
				console.log(e);
			}
		}
	);
};

const renderBBS_RECT = function(canvas, bb){
	var rect = configureRectangle(
		bb[1]*canvas.getWidth(), 
		bb[2]*canvas.getHeight(), 
		bb[3]*canvas.getWidth(),
		bb[4]*canvas.getHeight());
	canvas.add(rect);
	canvas.renderAll();
	createItemToBoundingBoxes(canvas, bb[0]);
}

const renderBBS_POLY = function(canvas, bb){
	var polygon = configurePoly([
		{
			x: bb[1]*canvas.getWidth(),
			y: bb[2]*canvas.getHeight()
		},
		{
			x: bb[3]*canvas.getWidth(),
			y: bb[4]*canvas.getHeight()
		},
		{
			x: bb[5]*canvas.getWidth(),
			y: bb[6]*canvas.getHeight()
		},
		{
			x: bb[7]*canvas.getWidth(),
			y: bb[8]*canvas.getHeight()
		},
	]);
	canvas.add(polygon);
	canvas.renderAll();
	createItemToBoundingBoxes(canvas, bb[0]);
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