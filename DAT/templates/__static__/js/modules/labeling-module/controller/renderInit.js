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

const initMaintask = function(canvas, url, view_init=null) {
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

			if(view_init){
				view_init.boxes_position.forEach(function(bb){
	            var shape = null;
				if(bb.type_label == 'rect'){
	                var position = bb.position.split(',');
	                shape = configureRectangle(
	                  position[0]*canvas.getWidth(),
	                  position[1]*canvas.getHeight(),
	                  (position[2]-position[0])*canvas.getWidth(),
	                  (position[3]-position[1])*canvas.getHeight(),
	                  bb.tag_label,
	                );
	              }
	              else{
	                var points = [];
	                var bbs = bb.position.split(',');
	                bbs.forEach(function(p, i){
	                  if (i%2==0){
	                    points.push({
	                      x:bbs[i]*canvas.getWidth(),
	                      y:bbs[i+1]*canvas.getHeight(),
	                    });
	                  }
	                })
	                shape = configurePoly(points, bb.tag_label);
	              }

	              shape.type_label = bb.type_label;
	              shape.stroke = bb.color;
	              shape.basicColor = bb.color;
	              shape.flag = bb.flag;
	              shape.accept_report_flag = bb.accept_report_flag;
	              canvas.add(shape);
	            });
	            canvas.renderAll();
			}
			
		}
	);
};

const renderBBS_RECT = function(canvas, bb){
	var rect = configureRectangle(
		bb[2]*canvas.getWidth(), 
		bb[3]*canvas.getHeight(), 
		(bb[4]-bb[2])*canvas.getWidth(),
		(bb[5]-bb[3])*canvas.getHeight(),
		bb[1], bb[0]);// __label_type__, __color__, __name__='', __accuracy__='1.0'
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