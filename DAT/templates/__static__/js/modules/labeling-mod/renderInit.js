import {fabric} from 'fabric';
import {createItemToList} from "./controller/label"
import {configurePoly, configureRectangle, configureFlag} from './drawtool';
import {drawStatus} from "../../labeling";

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

		shape.set({
			xmin: position[0],
			ymin: position[1],
			xmax: position[2],
			ymax: position[3],
		});
	}
	else{
		let points = [];
		let rpoints = [];
		let bbs = bb.position.split(',');
		bbs.forEach(function(p, i){
		  if (i%2==0) {
		    points.push({
		      x:bbs[i]*canvas.getWidth(),
		      y:bbs[i+1]*canvas.getHeight(),
		    });
		    rpoints.push({
		    	x: bbs[i],
		    	y: bbs[i+1],
		    });
		  }
		})
	  	shape = configurePoly(points, bb.tag_label);
	  	shape.set('rpoints', rpoints);
	}
	shape.set('type_label', bb.type_label);
	shape.set('stroke', bb.color);
	shape.icon.set('fill', bb.color);
	shape.set('flag', bb.flag);
	return shape;
}

const zoomDefautIt = (canvas) => {
    fabric.Image.fromURL(
    	canvas.url_meta,
    	function(img) {
    		var factor_choose = drawStatus.getFactor();
    		var new_w = canvas.originWidth * factor_choose;
    		var new_h = canvas.originHeight * factor_choose;
    		var ratio_w = new_w / canvas.getWidth();
    		var ratio_h = new_h / canvas.getHeight();

    		img.scaleToWidth(new_w);
			img.scaleToHeight(new_h);
			canvas.setWidth(new_w);
    		canvas.setHeight(new_h);
			canvas.setBackgroundImage(img);
			var objects = canvas.getObjects();

		    for (var i in objects) {
		        if (objects[i].type_label === 'poly'){
		            if (objects[i].labelControl.getIsEdit()){
		                objects[i].labelControl.cleanPolygonStuff(false);
		            }
		            objects[i].points.forEach(function(point, i){
		                point.x *= ratio_w;
		                point.y *= ratio_h;
		            });
		            objects[i].labelControl.circlesHandle();
		        }
		        else{
		            objects[i].scaleX *= ratio_w;
		            objects[i].scaleY *= ratio_h;
		            objects[i].left *= ratio_w;
		            objects[i].top *= ratio_h;
		            objects[i].setCoords();
		        }
		    }
		    canvas.renderAll();
		    canvas.calcOffset();
    	}
    );
};

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

				canvas.set('originWidth', wh[0]);
				canvas.set('originHeight', wh[1]);
				canvas.set('url_meta', meta.url_meta);
				canvas.setBackgroundImage(img);

				if(drawStatus.getFactor()!=1){
					zoomDefautIt(canvas);
				}

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