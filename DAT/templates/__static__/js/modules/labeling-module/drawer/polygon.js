import {createItemToList} from "../controller/label"
import {Color} from "../style/color"
import {fabric} from "fabric";
import {drawStatus} from "../../../labeling";

const MIN = 99;
const MAX = 999999;

const configureCircle = function(__x__, __y__, __name__=''){
	var circle = new fabric.Circle({
		radius: 2,
		fill: Color.YELLOW,
		left: __x__,
		top: __y__,
		hasBorders: false,
		hasControls: false,
		originX:'center',
		originY:'center',
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

const configureRectangle = function (
	__left__, __top__, __width__, __height__, __name__='', __accuracy__='1.0'){

	var rect = new fabric.Rect({
		left: __left__,
		top: __top__,
		width: __width__,
		height: __height__,

		originX: 'left',
		originY: 'top',
		hasBorder: true,
		stroke: drawStatus.getColorlabel(),
		strokeWidth: drawStatus.getStrokelabel(),
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
		name: __name__,
		accuracy: __accuracy__,
		basicColor: drawStatus.getColorlabel(),
		flag:-1,
		type_label: 'type_label',
		accept_edit: true,
	});
	
	rect.setControlVisible('mtr', false);
	rect.setControlVisible('ml', false);
	rect.setControlVisible('mt', false);
	rect.setControlVisible('mr', false);
	rect.setControlVisible('mb', false);

	configureIconLabel(__left__+(__width__/2), __top__+(__height__/2), rect);

	return rect;
}



const configurePoly = function(__points__, __name__='', __accuracy__='1.0', __circles__=[]){
	
	var type_poly = (__points__.length == 4) ? 'quad' : 'poly';

	var polygon = new fabric.Polygon(__points__,{
		hasControls: false,
		originX: 'left',
		originY: 'top',
		hasBorders: false,
		stroke: drawStatus.getColorlabel(),
		strokeWidth: drawStatus.getStrokelabel(),
		fill:'transparent',
		transparentCorners: true,
		cornerSize: 10,
		objectCaching: false,
		selectable: false,
		name:__name__,
		accuracy: __accuracy__,
		circles: __circles__,
		basicColor: drawStatus.getColorlabel(),
		flag:-1,
		type_label: 'type_label',
		accept_edit: true,
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
		name_id: 'icon',

	});
	object.icon = icon;
	return icon;
}

class DrawPolygon{
	constructor(__canvas__) {

		const drawer = this;
		drawer.canvas = __canvas__;
		drawer.polygonMode = true;
		drawer.pointArray = new Array();
		drawer.lineArray = new Array();
		drawer.rectangle;
		drawer.activeLine;
		drawer.activeShape = false;
		drawer.typePoly = 'poly';

		drawer.polygon = {
			drawPolygon : function() {
				drawer.polygonMode = true;
				drawer.pointArray = new Array();
				drawer.lineArray = new Array();
			},
			addPoint : function(o) {
				var random = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
				var name = new Date().getTime() + random;
				
				var pointer = drawer.canvas.getPointer(o.e);

				var circle = configureCircle(pointer.x, pointer.y, name);
				circle.set({fill:Color.WHITE});
				if(drawer.pointArray.length == 0){
					circle.set({
						fill:Color.RED,
					})
				}

				var points = [pointer.x, pointer.y, pointer.x, pointer.y];

				var line = configureLine(points);

				if(drawer.activeShape){
					var pos = drawer.canvas.getPointer(o.e);
					var points = drawer.activeShape.get("points");
					points.push({
						x: pos.x,
						y: pos.y
					});
					var polygon = new fabric.Polygon(polyPoint, {
						stroke:'#333333',
						strokeWidth: 1,
						fill: '#cccccc',
						opacity: 0.1,
						selectable: false,
						hasBorders: false,
						hasControls: false,
						evented: false
					});

					drawer.canvas.remove(drawer.activeShape);
					drawer.canvas.add(polygon);
					drawer.activeShape = polygon;
					drawer.canvas.renderAll();
				}
				else{
					var pointer = drawer.canvas.getPointer(o.e);
					var polyPoint = [{x:pointer.x, y:pointer.y}];

					var polygon = new fabric.Polygon(polyPoint,{
						stroke:'#333333',
						strokeWidth:1,
						fill: '#cccccc',
						opacity: 0.1,
						selectable: false,
						hasBorders: false,
						hasControls: false,
						evented: false
					});

					drawer.activeShape = polygon;
					drawer.canvas.add(polygon);
				}
				drawer.activeLine = line;

				drawer.pointArray.push(circle);
				drawer.lineArray.push(line);

				drawer.canvas.add(line);
				drawer.canvas.add(circle);
				drawer.canvas.selection = false;
			},
			generatePolygon : function(pointArray){
				var points = new Array();
				var namelabel = document.getElementById("label").textContent;

				pointArray.forEach(function(point, index){
					points.push({
						x:point.left,
						y:point.top
					});
					drawer.canvas.remove(point);
				});
				drawer.lineArray.forEach(function(line){
					drawer.canvas.remove(line);
				});

				drawer.canvas.remove(drawer.activeShape).remove(drawer.activeLine);
				
				if(drawer.typePoly == 'rect'){
					
					var __left__ = drawer.rectangle.left, 
					__top__ = drawer.rectangle.top, 
					__width__ = drawer.rectangle.width, 
					__height__ = drawer.rectangle.height;
					
					drawer.canvas.remove(drawer.rectangle);

					if(__width__ > 15 && __height__ > 10){

						var rect = configureRectangle(
							__left__, __top__, __width__, __height__, namelabel) ;
						rect.type_label = drawer.typePoly;
						drawer.canvas.add(rect);

						createItemToList(drawer.canvas, rect);

					}
				}
				else {

					var polygon = configurePoly(points, namelabel)
					polygon.type_label = drawer.typePoly;
					drawer.canvas.add(polygon);
					
					createItemToList(drawer.canvas, polygon);
					
				}
				
				drawer.activeLine = null;
				drawer.activeShape = null;
				drawer.polygonMode = false;
				drawer.canvas.selection = true;
				
				drawer.canvas.renderAll();
				
				

				drawer.startDraw();
			}
		};


		drawer.mouseDown = function(o){

			if(!drawStatus.getZoomSpaceKey()){
				var pointer = drawer.canvas.getPointer(o.e);

				if (drawer.typePoly == 'rect'){

					drawer.polygon.addPoint(o);

					if (drawer.pointArray.length == 1){

						var fp = drawer.pointArray[0];
						drawer.origX = pointer.x;
						drawer.origY = pointer.y;

						var points = [fp.left, fp.top, fp.left, fp.top];
						var line = configureLine(points);

						drawer.rectangle = configureRectangle(
							drawer.origX,
							drawer.origY,
							pointer.x-drawer.origX,
							pointer.y-drawer.origY,
							document.getElementById("label").textContent,
							);

						drawer.lineArray.push(line);
						drawer.canvas.add(line);
						drawer.canvas.add(drawer.rectangle);
					}
					if (drawer.pointArray.length == 2){
						drawer.polygon.generatePolygon(drawer.pointArray);
					}
				}
				else if(drawer.typePoly == 'quad'){

					if (drawer.pointArray.length == 2){
						var fp = drawer.pointArray[0];
						var points = [fp.left, fp.top, fp.left, fp.top];
						var line = configureLine(points);

						drawer.finalLineActive = line;
						drawer.lineArray.push(line);
						drawer.canvas.add(line);
					}
					if (drawer.pointArray.length == 3){
						drawer.polygon.addPoint(o);
						drawer.polygon.generatePolygon(drawer.pointArray);
					}
					else {
						drawer.polygon.addPoint(o);
					}
				}
				else if (o.target && o.target.name == drawer.pointArray[0].name){
					if(!drawer.isQuadrilateral){
						drawer.polygon.generatePolygon(drawer.pointArray);
					}
				}
				else if(drawer.polygonMode){
					drawer.polygon.addPoint(o);	
				}
			}
		}

		drawer.mouseMove= function(o){

			if(drawer.activeLine && drawer.activeLine.class == "line"){

				// drawStatus.setIsDrawing(true);
				drawStatus.setIsWaiting(false);
				
				var pointer = drawer.canvas.getPointer(o.e);
				drawer.activeLine.set({ x2: pointer.x, y2: pointer.y });

				var points = drawer.activeShape.get("points");
				points[drawer.pointArray.length] = {
					x:pointer.x,
					y:pointer.y
				}
				if(drawer.typePoly=='quad' && drawer.pointArray.length == 3){
					drawer.finalLineActive.set({ x2: pointer.x, y2: pointer.y })
				}
				else if (drawer.typePoly == 'rect' && drawer.pointArray.length == 1){

					if(drawer.origX>pointer.x){
						drawer.rectangle.set({ left: Math.abs(pointer.x) });
					}
					if(drawer.origY>pointer.y){
						drawer.rectangle.set({ top: Math.abs(pointer.y) });
					}

					drawer.rectangle.set({ width: Math.abs(drawer.origX - pointer.x) });
					drawer.rectangle.set({ height: Math.abs(drawer.origY - pointer.y) });
				}
				drawer.activeShape.set({
					points: points
				});
				drawer.canvas.renderAll();
			}
			drawer.canvas.renderAll();
		}

		drawer.mouseUp= function(o){
			if(drawer.activeLine == null){
				// drawStatus.setIsDrawing(false);
				drawStatus.setIsWaiting(true);
			}
		}
	}

	startDraw(id, namelabel){
		this.endDraw();

		this.canvas.getObjects().forEach(function(obj){
			if(obj.labelControl){
				obj.labelControl.__editITEM__(false);
			}
		});

		this.canvas.defaultCursor = 'crosshair';

		drawStatus.startDrawStatus(id, namelabel);
		
		this.polygon.drawPolygon();
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

	setType(value){
		this.typePoly = value;
	}
}

export {configureCircle, configureLine, configureRectangle, configurePoly, DrawPolygon};