import {createItemToList} from "./controller/label"
import {Color} from "./style/color"
import {fabric} from "fabric";
import {drawStatus} from "../../labeling";

const MIN = 99;
const MAX = 999999;

const configureCircle = function(__x__, __y__, __name__=''){
	var circle = new fabric.Circle({
		radius: drawStatus.getIsZoom() ? 2 : 4,
		fill: Color.YELLOW,
		stroke: 'red',
		left: __x__,
		top: __y__,
		hasBorders: false,
		hasControls: false,
		originX:'center',
		originY:'center',
		strokeWidth: 1,
		name:__name__,
	});
	return circle;
}

const configureLine = function(__points__, __color__=Color.WHITE){
	var line = new fabric.Line(__points__, {
		strokeWidth: 1,
		fill: __color__,
		stroke: __color__,
		class:'line',
		originX:'center',
		originY:'center',
		selectable: false,
		hasBorders: false,
		hasControls: false,
		evented: false,
	});

	return line;
}

const configureLinePoly = function(__points__){
	let line = new fabric.Line(__points__, {
		strokeWidth: drawStatus.getIsZoom() ? 2 : 4,
		fill: Color.WHITE,
		stroke: Color.WHITE,
		strokeDashArray: [8, 8],
		class:'line',
		originX:'center',
		originY:'center',
		selectable: false,
		hasBorders: false,
		hasControls: false,
		evented: false,
	});

	return line;
}

const configureRectangle = function (
	__left__, __top__, __width__, __height__, __name__='', __accuracy__='1.0'){
	let name = __name__ != '' ? __name__ : drawStatus.getNameLabel();

	let rect = new fabric.Rect({
		left: __left__,
		top: __top__,
		width: __width__,
		height: __height__,

		originX: 'left',
		originY: 'top',
		hasBorder: true,
		stroke: drawStatus.getColorLabel(),
		strokeWidth: drawStatus.getStrokeLabel(),
		fill:'transparent',
		transparentCorners: false,
		cornerStrokeColor: 5,
		noScaleCache: false,
		cornerStyle: 'circle',
		cornerSize: 13,
		cornerColor: Color.YELLOW,
		lockSkewingX: true,
		lockSkewingY: true,
		flipX: false,
		flipY: false,
		lockScalingFlip: true,
		selectable: false,
		name: name,
		accuracy: __accuracy__,
		flag:-1,
		type_label: 'rect',
		accept_edit: true,
		islabel: true,
	});
	
	rect.setControlVisible('mtr', false);
	rect.setControlVisible('ml', false);
	rect.setControlVisible('mt', false);
	rect.setControlVisible('mr', false);
	rect.setControlVisible('mb', false);

	configureIconLabel(__left__+(__width__/2), __top__+(__height__/2), rect);

	return rect;
}

const configurePoly = function(__points__, __name__= '', __accuracy__='1.0', __circles__=[]){
	
	let name = __name__ != '' ? __name__ : drawStatus.getNameLabel();

	let polygon = new fabric.Polygon(__points__,{
		hasControls: false,
		originX: 'left',
		originY: 'top',
		hasBorders: false,
		stroke: drawStatus.getColorLabel(),
		strokeWidth: drawStatus.getStrokeLabel(),
		fill:'transparent',
		transparentCorners: true,
		cornerSize: 10,
		objectCaching: false,
		selectable: false,
		name: name,
		accuracy: __accuracy__,
		circles: __circles__,
		flag:-1,
		type_label: 'poly',
		accept_edit: true,
		islabel: true,
		start_index: -1,
	});

	var __left__ = polygon.left + polygon.width / 2;
	var __top__ = polygon.top + polygon.height / 2;

	configureIconLabel(__left__, __top__, polygon);

	return polygon;
}

const configureIconLabel = function(__left__, __top__, object){
	
	var radius = document.getElementById("size_icon");

	const icon = new fabric.Circle({
		radius: radius ? radius.textContent : 3,
		fill: object.stroke,
		left: __left__,
		top: __top__,
		hasBorders: false,
		hasControls: false,
		selectable: false,
		originX:'center',
		originY:'center',
		object: object,
		isIcon: true,
	});
	object.icon = icon;
	return icon;
}

const configureFlag = function(master) {
	var flag;
	if (master.flag == 1) {
		flag = configureRectangle(master.left-7, master.top-7, 14, 14);
		flag.set('islabel', false);
		flag.set('isflag', true);
		flag.set('stroke', master.stroke);
		flag.set('fill', Color.GREEN);
		master.shapeflag = flag;
	}
	else if (master.flag == 0) {
		flag = configureCircle(master.left, master.top);
		flag.set('radius', 9);
		flag.set('islabel', false);
		flag.set('isflag', true);
		flag.set('stroke', master.stroke);
		flag.set('fill', Color.RED);

		master.shapeflag = flag;
	}
	return flag;
}

class DrawTool{
	constructor(__canvas__) {

		const drawer = this;
		
		drawer.rectangle;

		//variable in use
		drawer.canvas = __canvas__;
		drawer.pointArray = new Array();
		drawer.lineArray = new Array();

		//new variable
		drawer.typeLabel = null;
		drawer.lastLine = null;
		drawer.firstPoint = null;
		//end new variable

		drawer.tool = {
			
			initTool : function() {
				drawer.pointArray = new Array();
				drawer.lineArray = new Array();
			},

			generateShapeLabel : function(){
				let new_object;
				let only = false;
				drawer.lineArray.forEach(function(line){
					drawer.canvas.remove(line);
				});
				drawer.canvas.remove(drawer.firstPoint);
				drawer.canvas.remove(drawer.lastLine);
				
				if (drawer.typeLabel === 'rect') {
					
					let listRectLabel = drawStatus.getListLabelRect();

					drawer.canvas.remove(drawer.rectangle);
					
					new_object = configureRectangle(
						drawer.rectangle.left, drawer.rectangle.top, 
						drawer.rectangle.width, drawer.rectangle.height);

					if (listRectLabel.length === 1){
						let values = listRectLabel[0].info.split(','); //tag_label, type_label, color
						new_object.set('name', values[0]);
						new_object.set('stroke', values[2]);
						new_object.icon.set('fill', values[2]);
						only = true;
					}

					drawer.canvas.add(new_object);
					createItemToList(drawer.canvas, new_object);
				}
				else if (drawer.typeLabel === 'poly') {
					if(drawer.pointArray.length > 2) {

						let listPolyLabel = drawStatus.getListLabelPoly();

						new_object = configurePoly(drawer.pointArray);

						if (listPolyLabel.length === 1){
							let values = listPolyLabel[0].info.split(','); //tag_label, type_label, color
							new_object.set('name', values[0]);
							new_object.set('stroke', values[2]);
							new_object.icon.set('fill', values[2]);
							only = true;
						}

						drawer.canvas.add(new_object);
						createItemToList(drawer.canvas, new_object);
					}
				}

				//hardcode here
				drawStatus.setRenewLabel(true);
				new_object.set('name', '');

				if (new_object && !only && drawStatus.getRenewLabel()) {
					drawStatus.setIsChangingLabel(true);
					let changelb = document.getElementById(new_object.labelControl.getId()+"_changelabel");
					changelb && changelb.click();
				}

				drawer.pointArray.lenth = new Array();;
				drawer.lineArray.lenth = new Array();;
				drawer.typeLabel = null;
				drawer.lastLine = null;
				drawer.firstPoint = null;
				drawer.canvas.selection = true;

				//end new code
				drawer.startDraw();

			},
		};

		drawer.mouseDown = function(o){
			let clickbtn = o.button;

			if (!drawStatus.getZoomSpaceKey()) {
				if(clickbtn === 1) {
					let pointer = drawer.canvas.getPointer(o.e);
					drawer.pointArray.push({x: pointer.x, y: pointer.y});
					if (drawer.pointArray.length === 1) {
						drawer.firstPoint = configureCircle(pointer.x, pointer.y, 'fp');
						drawer.firstPoint.set({
							fill:'#FF0000',
							radius: drawStatus.getIsZoom() ? 2 : 5,
							selectable: false,
						});

						let points = [pointer.x, pointer.y, pointer.x, pointer.y];
						let line = configureLinePoly(points);

						drawer.lastLine = line;
						drawer.canvas.add(line);
						drawer.canvas.add(drawer.firstPoint);

						//first configure default is drawing rectangle
						drawer.origX = pointer.x;
						drawer.origY = pointer.y;
						drawer.rectangle = configureRectangle(
							drawer.origX,
							drawer.origY,
							pointer.x-drawer.origX,
							pointer.y-drawer.origY
						);
							
						drawer.canvas.add(drawer.rectangle);
						drawer.typeLabel = 'rect';
					}
					else{
						//must be polygon, so change type of drawing mode to polygon
						if (drawer.firstPoint) {
							drawer.canvas.remove(drawer.firstPoint);
							drawer.firstPoint = null;
						}

						//last point and new point
						let firstpoint = drawer.pointArray[0];
						let lastpoint = drawer.pointArray[drawer.pointArray.length - 2];
						let newline = configureLinePoly([lastpoint.x, lastpoint.y, pointer.x, pointer.y]);

						drawer.lineArray.push(newline);
						drawer.canvas.add(newline);

						drawer.canvas.remove(drawer.lastLine);
						drawer.lastLine = configureLinePoly([pointer.x, pointer.y, firstpoint.x, firstpoint.y]);
						drawer.canvas.add(drawer.lastLine);
					}
				}
				else if (clickbtn === 3 && drawer.typeLabel === 'poly') { //right mouse click
					drawer.tool.generateShapeLabel();
				}
			}
		}

		drawer.mouseMove= function(o){

			//check firstPoint or typeLabel same time for sure;
			if (drawer.firstPoint && drawer.typeLabel === 'rect') {
				drawStatus.setIsWaiting(false);
				let pointer = drawer.canvas.getPointer(o.e);
				if(drawer.origX > pointer.x){
					drawer.rectangle.set({ left: Math.abs(pointer.x) });
				}
				else {
					drawer.rectangle.set({ left: drawer.origX });
				}

				if(drawer.origY > pointer.y){
					drawer.rectangle.set({ top: Math.abs(pointer.y) });
				}
				else {
					drawer.rectangle.set({ top: drawer.origY });
				}

				drawer.rectangle.set({ width: Math.abs(drawer.origX - pointer.x) });
				drawer.rectangle.set({ height: Math.abs(drawer.origY - pointer.y) });
			}
		}

		drawer.mouseUp= function(o){
			drawStatus.setIsWaiting(drawer.typeLabel === null);

			if(drawer.typeLabel === 'rect') {
				let __width__ = drawer.rectangle.width, 
				__height__ = drawer.rectangle.height;
				if(__width__ > 13 && __height__ > 8) {
					drawer.canvas.remove(drawer.firstPoint);
					drawer.firstPoint = null;
					drawer.tool.generateShapeLabel();
				}
				else {
					drawer.canvas.remove(drawer.rectangle);
					drawer.rectangle = null;
					//must be polygon
					drawer.typeLabel = 'poly';
				}
			}
		}
	}

	startDraw(id, namelabel, typelabel){
		this.endDraw();

		this.canvas.getObjects().forEach(function(obj){
			if(obj.labelControl){
				obj.labelControl.__editITEM__(false);
			}
		});

		this.canvas.defaultCursor = 'crosshair';

		if(typelabel){
			this.typeLabel = typelabel	
		}

		drawStatus.startDrawStatus();
		
		this.tool.initTool();
		this.canvas.on('mouse:down', this.mouseDown);
		this.canvas.on('mouse:move', this.mouseMove);
		this.canvas.on('mouse:up', this.mouseUp);
	}

	endDraw(){
		this.canvas.defaultCursor = 'default';
		
		drawStatus.stopDrawStatus();

		this.canvas.off('mouse:down', this.mouseDown);
		this.canvas.off('mouse:move', this.mouseMove);
		this.canvas.off('mouse:up', this.mouseUp);
	}

	quickDraw() {

		var drawer = this;
		drawer.canvas.remove(drawer.firstPoint);
		drawer.canvas.remove(drawer.lastLine);
		drawer.canvas.remove(drawer.rectangle);

		drawer.lineArray.forEach(function(line){
			drawer.canvas.remove(line);
		});

		drawer.pointArray.lenth = 0;
		drawer.lineArray.lenth = 0;
		drawer.typeLabel = null;
		drawer.lastLine = null;
		drawer.firstPoint = null;
		drawer.canvas.selection = true;

		drawStatus.setIsWaiting(true);
		drawer.startDraw();
	}

}

export {configureFlag, configureCircle, configureLine, configureLinePoly, configureRectangle, configurePoly, DrawTool};