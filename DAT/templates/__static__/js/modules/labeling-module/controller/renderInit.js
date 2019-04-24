import {fabric} from 'fabric';
import {createItemToList} from "./label"
import {configurePoly, configureRectangle} from '../drawer/polygon';
import {Color} from "../style/color"

function image_convert(img){
	var parent = document.getElementById("cvcontainer");
	if(parent){
		var scale = Math.min( 
			parent.clientWidth / img.width, 
			parent.clientHeight / img.height 
			);
		return [img.width*scale, img.height*scale]
	}
}

const initMaintask = function(canvas, url) {
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
		}
		);
};

const renderBBS_RECT = function(canvas, bb){
	var rect = configureRectangle(
		bb[2]*canvas.getWidth(), 
		bb[3]*canvas.getHeight(), 
		(bb[4]-bb[2])*canvas.getWidth(),
		(bb[5]-bb[3])*canvas.getHeight(),
		bb[1], bb[0]);
	rect.set('stroke', Color.BLUE);
	canvas.add(rect);
	canvas.renderAll();
	createItemToList(canvas, rect);
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
	], __name__=bb[1], __accuracy__=bb[0]);
	polygon.set('stroke', Color.BLUE);
	canvas.add(polygon);
	canvas.renderAll();
	createItemToList(canvas, polygon);
	return polygon;
}

export {initMaintask, renderBBS_RECT, renderBBS_POLY}