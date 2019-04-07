import {createItemToBoundingBoxes, AllCheckBoxEdit} from '../controller/labelControl';
import {fabric} from "fabric";

const MIN = 99;
const MAX = 999999;

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
				drawer.pointArray = new Array();
				drawer.lineArray = new Array();
				// drawer.activeLine;
			},
			addPoint : function(o) {
				var random = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
				var id = new Date().getTime() + random;
				
				var pointer = drawer.canvas.getPointer(o.e);

				var circle = new fabric.Circle({
					radius: 7,
					fill: '#ffffff',
					stroke: '#333333',
					strokeWidth: 0.5,
					left: pointer.x,
					top: pointer.y,
					selectable: false,
					hasBorders: false,
					hasControls: false,
					originX:'center',
					originY:'center',
					id:id
				});
				if(drawer.pointArray.length == 0){
					circle.set({
						fill:'yellow'
					})
				}

				var points = [pointer.x, pointer.y, pointer.x, pointer.y];

				var line = new fabric.Line(points, {
					strokeWidth: 2,
					fill: '#999999',
					stroke: '#999999',
					class:'line',
					originX:'center',
					originY:'center',
					selectable: false,
					hasBorders: false,
					hasControls: false,
					evented: false
				});
				if(drawer.activeShape){
					var pos = drawer.canvas.getPointer(o.e);
					var points = drawer.activeShape.get("points");
					points.push({
						x: pos.x,
						y: pos.y
					});
					var polygon = new fabric.Polygon(points,{
						stroke:'#333333',
						strokeWidth:1,
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
				var polygon = new fabric.Polygon(points,{
					hasControls: false,
					originX: 'left',
					originY: 'top',
					hasBorder: true,
					stroke: 'blue',
					strokeWidth: 3,
					fill:'transparent',
					transparentCorners: true,
					cornerSize: 10,
				});
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
					var line = new fabric.Line(points, {
						strokeWidth: 2,
						fill: '#999999',
						stroke: '#999999',
						class:'line',
						originX:'center',
						originY:'center',
						selectable: false,
						hasBorders: false,
						hasControls: false,
						evented: false
					});
					drawer.finalLineActive = line;
					drawer.lineArray.push(line);
					drawer.canvas.add(line);
				}
				if (drawer.pointArray.length == 3){
					drawer.polygon.addPoint(o);
					drawer.polygon.generatePolygon(drawer.pointArray);
				}
			}
			else if (o.target && o.target.id == drawer.pointArray[0].id){
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
		this.polygon.drawPolygon();
		this.canvas.on('mouse:down', this.mouseDown);
		this.canvas.on('mouse:move', this.mouseMove);
		this.canvas.on('mouse:up', this.mouseUp);
	}

	endDraw(){
		this.canvas.off('mouse:down', this.mouseDown);
		this.canvas.off('mouse:move', this.mouseMove);
		this.canvas.off('mouse:up', this.mouseUp);
	}

	setisQuadrilateral(value){
		this.isQuadrilateral = value;
	}
}


export {DrawPolygon};