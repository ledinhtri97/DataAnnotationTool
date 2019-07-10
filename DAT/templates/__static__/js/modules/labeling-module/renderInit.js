import {fabric} from 'fabric';
import {createItemToList} from "./controller/label"
import {configurePoly, configureRectangle, configureFlag} from './drawtool';
import {Color} from "./style/color"

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
	shape.set('type_label', bb.type_label);
	shape.set('stroke', bb.color);
	shape.icon.set('fill', bb.color);
	shape.set('flag', bb.flag);
	return shape;
}

const initCanvas = function(canvas, meta, only_view=false) {
	fabric.Image.fromURL(
		meta.url_meta,
		function(img) {
			var wh = image_convert(img);
			if(wh){
				img.scaleToWidth(wh[0]);
				img.scaleToHeight(wh[1]);
				canvas.setWidth(wh[0]);
				canvas.setHeight(wh[1]);
				canvas.setBackgroundImage(img);

				canvas.renderAll();

				setTimeout(function(){
					if(meta.status === 'OK' && meta.boxes_position){
						
						meta.boxes_position.forEach(function(bb){
				            var shape = create_shape(bb, canvas);
				            canvas.add(shape);
				            if(!only_view) {
				            	createItemToList(canvas, shape);
				    			// var e_hidden = document.getElementById(shape.labelControl.getId()+"_hidden");
								// e_hidden && e_hidden.click();
				            };
			            });

			            canvas.renderAll();
					}
				}, 500);	
			}
		}
	);
};

const initPredict = function(canvas, meta){

	meta.predict && meta.status === 'OK' && meta.predict.forEach(function(bb){
		var shape = create_shape(bb, canvas);
		shape.accuracy = bb.conf
		shape.accept_edit = bb.accept_edit;
		canvas.add(shape);
		if (!shape.accept_edit) {
			var flag = configureFlag(shape);
			canvas.add(flag);
		}
		canvas.renderAll();
		createItemToList(canvas, shape);
		// var e_hidden = document.getElementById(shape.labelControl.getId()+"_hidden");
		// e_hidden && e_hidden.click();
	});  
}

export {initCanvas, initPredict}