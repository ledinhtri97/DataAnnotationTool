import {createItemToBoundingBoxes, AllCheckBoxEdit} from '../controller/itemReact';
import {Color} from "../style/color"
import {fabric} from "fabric";
import {drawStatus} from "../maintask";

const MIN = 99;
const MAX = 999999;

const configureCircle = function(__x__, __y__, __name__){
	var circle = new fabric.Circle({
		radius: 7,
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

const configureLine = function(__points__){
	var line = new fabric.Line(__points__, {
		strokeWidth: 2,
		fill: Color.GRAY,
		stroke: Color.GRAY,
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

const configurePoly = function(__points__, __name__='', __color__=Color.GREEN){
	var polygon = new fabric.Polygon(__points__,{
		hasControls: false,
		originX: 'left',
		originY: 'top',
		hasBorders: false,
		stroke: __color__,
		strokeWidth: 3,
		fill:'transparent',
		transparentCorners: true,
		cornerSize: 10,
		objectCaching: false,
		selectable: false,
		name:__name__,
	});

	return polygon;
}

class DrawPolygon{
	constructor(__canvas__) {

		const drawer = this;
		drawer.canvas = __canvas__;
		drawer.polygonMode = true;
		drawer.pointArray = new Array();
		drawer.lineArray = new Array();
		drawer.activeLine;
		drawer.activeShape = false;
		drawer.isQuadrilateral = false;

		drawer.polygon = {
			drawPolygon : function() {
				drawer.polygonMode = true;
				drawStatus.setIsDrawing(true);
				drawer.pointArray = new Array();
				drawer.lineArray = new Array();
				// drawer.activeLine;
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

					// configurePoly(polyPoint);
					// polygon.set('opacity', 0.1);
					// polygon.set('fill', Color.GRAY);

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
				drawStatus.setIsDrawing(false);
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
				var polygon = configurePoly(points, document.getElementById("label").textContent)
				drawer.canvas.add(polygon);

				drawer.activeLine = null;
				drawer.activeShape = null;
				drawer.polygonMode = false;
				drawer.canvas.selection = true;
				// drawer.canvas.renderAll();
				drawer.endDraw();
				createItemToBoundingBoxes(drawer.canvas, document.getElementById("label").textContent);
			}
		};


		drawer.mouseDown = function(o){

			if(drawer.isQuadrilateral){
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
			}
			else if (o.target && o.target.name == drawer.pointArray[0].name){
				if(!drawer.isQuadrilateral){
					drawer.polygon.generatePolygon(drawer.pointArray);
				}
			}
			if(drawer.polygonMode){
				drawer.polygon.addPoint(o);
			}
		}

		drawer.mouseMove= function(o){

			if(drawer.activeLine && drawer.activeLine.class == "line"){
				var pointer = drawer.canvas.getPointer(o.e);
				drawer.activeLine.set({ x2: pointer.x, y2: pointer.y });

				var points = drawer.activeShape.get("points");
				points[drawer.pointArray.length] = {
					x:pointer.x,
					y:pointer.y
				}
				if(drawer.isQuadrilateral && drawer.pointArray.length == 3){
					drawer.finalLineActive.set({ x2: pointer.x, y2: pointer.y })
				}
				drawer.activeShape.set({
					points: points
				});
				drawer.canvas.renderAll();
			}
			drawer.canvas.renderAll();
		}

		drawer.mouseUp= function(o){
		}
	}

	startDraw(){
		AllCheckBoxEdit(this.canvas, false);
		
		this.canvas.defaultCursor = 'pointer';

		this.polygon.drawPolygon();
		this.canvas.on('mouse:down', this.mouseDown);
		this.canvas.on('mouse:move', this.mouseMove);
		this.canvas.on('mouse:up', this.mouseUp);
	}

	endDraw(){
		
		this.canvas.defaultCursor = 'default';

		this.canvas.off('mouse:down', this.mouseDown);
		this.canvas.off('mouse:move', this.mouseMove);
		this.canvas.off('mouse:up', this.mouseUp);
	}

	setisQuadrilateral(value){
		this.isQuadrilateral = value;
	}
}

export {configureCircle, configureLine, configurePoly, DrawPolygon};