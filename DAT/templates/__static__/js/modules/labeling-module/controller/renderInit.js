import {fabric} from 'fabric';
import {createItemToList} from "./label"
import {configurePoly, configureRectangle, configureFlag} from '../drawer/polygon';
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

const create_shape = (bb, canvas) => {
	var shape;
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
		  if (i%2==0) {
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
	shape.icon.fill = bb.color;
	shape.flag = bb.flag;
	return shape;
}

const initMaintask = function(canvas, meta, only_view=false) {
	fabric.Image.fromURL(
		meta.url_meta,
		function(img) {
			var wh = image_convert(img)
			img.scaleToWidth(wh[0]);
			img.scaleToHeight(wh[1]);
			canvas.setWidth(wh[0]);
			canvas.setHeight(wh[1]);
			canvas.setBackgroundImage(img);

			canvas.renderAll();

			if(meta.status === 'OK'){
				meta.boxes_position.forEach(function(bb){
		            var shape = create_shape(bb, canvas);
		            canvas.add(shape);
		            canvas.renderAll();
		            if(!only_view) createItemToList(canvas, shape);
	            });

	            meta.predict.forEach(function(bb){
		            var shape = create_shape(bb, canvas);
		            shape.accuracy = bb.conf
		            shape.accept_edit = bb.accept_edit;
		            canvas.add(shape);

		            if (!shape.accept_edit) {
		            	var flag = configureFlag(shape);
		            	canvas.add(flag);
		            }

		            canvas.renderAll();
		            if(!only_view) createItemToList(canvas, shape);
	            });  
			}
			
		}
	);
};

export {initMaintask}