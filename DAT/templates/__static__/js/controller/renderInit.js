import {fabric} from 'fabric';
import {createItemToBoundingBoxes} from './itemReact';
// import {configureRectangle} from '../drawer/rectangle';
import {configurePoly, configureRectangle} from '../drawer/polygon';
import {Color} from "../style/color"

function image_convert(img){
	var parent = document.getElementById("cvcontainer");

	var scale = Math.min( 
		parent.clientWidth / img.width, 
		parent.clientHeight / img.height 
		);
	return [img.width*scale, img.height*scale]
}

const initMaintask = function(canvas, url, bbs='') {
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
			// try {
			// 	bbs.split('\n').forEach(function(line){
			// 		var info = line.split(',');
			// 		if (info.length==5){
			// 			renderBBS_RECT(canvas, info);	
			// 		}
			// 		else if (info.length==9){
			// 			renderBBS_POLY(canvas, info);
			// 		}
			// 	});
			// } catch(e) {
			// 	console.log(e);
			// }
		}
	);
};

const renderBBS_RECT = function(canvas, bb){
	var rect = configureRectangle(
		bb[2]*canvas.getWidth(), 
		bb[3]*canvas.getHeight(), 
		(bb[4]-bb[2])*canvas.getWidth(),
		(bb[5]-bb[3])*canvas.getHeight(),
		bb[1], Color.BLUE, bb[0]);
	canvas.add(rect);
	canvas.renderAll();
	createItemToBoundingBoxes(canvas, bb[1]);
	return rect;
}

const renderBBS_POLY = function(canvas, bb){

	var polygon = configurePoly([
		{
			x: bb[2]*canvas.getWidth(),
			y: bb[3]*canvas.getHeight()
		},
		{
			x: bb[4]*canvas.getWidth(),
			y: bb[5]*canvas.getHeight()
		},
		{
			x: bb[6]*canvas.getWidth(),
			y: bb[7]*canvas.getHeight()
		},
		{
			x: bb[8]*canvas.getWidth(),
			y: bb[9]*canvas.getHeight()
		},
	], bb[1], Color.BLUE, bb[0]);
	canvas.add(polygon);
	canvas.renderAll();
	createItemToBoundingBoxes(canvas, bb[1]);
	return polygon;
}

export {initMaintask, renderBBS_RECT, renderBBS_POLY}