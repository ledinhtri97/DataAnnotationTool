import {createItemToBoundingBoxes, configRectangle, AllCheckBoxEdit} from '../controller/labelControl';
import {fabric} from "fabric";

const MIN = 99;
const MAX = 999999;

class DrawQuadrilateral{
	constructor(__canvas__, __tag__) {

		const drawer = this;
		drawer.canvas = __canvas__;
		drawer.tag = __tag__;
		drawer.polygonMode = true;
		drawer.pointArray = new Array();
		drawer.lineArray = new Array();
		drawer.activeLine;
		drawer.activeShape = false;

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
					radius: 5,
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
			}
		};


		drawer.mouseDown = function(o){
			// drawer.isDown = true;
			// var pointer = drawer.canvas.getPointer(o.e);
			// drawer.origX = pointer.x;
			// drawer.origY = pointer.y;
			// var pointer = drawer.canvas.getPointer(o.e);
			// drawer.rect = configRectangle(
			// 	drawer.origX,
			// 	drawer.origY,
			// 	pointer.x-drawer.origX,
			// 	pointer.y-drawer.origY
			// 	);
			//

			if(o.target && o.target.id == drawer.pointArray[0].id){
				drawer.polygon.generatePolygon(drawer.pointArray);
			}
			if(drawer.polygonMode){
				drawer.polygon.addPoint(o);
			}
		}

		drawer.mouseMove= function(o){
			// if (!drawer.isDown) return;
			// var pointer = drawer.canvas.getPointer(o.e);

			// if(drawer.origX>pointer.x){
			// 	drawer.rect.set({ left: Math.abs(pointer.x) });
			// }
			// if(drawer.origY>pointer.y){
			// 	drawer.rect.set({ top: Math.abs(pointer.y) });
			// }

			// drawer.rect.set({ width: Math.abs(drawer.origX - pointer.x) });
			// drawer.rect.set({ height: Math.abs(drawer.origY - pointer.y) });

			// drawer.canvas.renderAll();

			if(drawer.activeLine && drawer.activeLine.class == "line"){
				var pointer = drawer.canvas.getPointer(o.e);
				drawer.activeLine.set({ x2: pointer.x, y2: pointer.y });

				var points = drawer.activeShape.get("points");
				points[drawer.pointArray.length] = {
					x:pointer.x,
					y:pointer.y
				}
				drawer.activeShape.set({
					points: points
				});
				drawer.canvas.renderAll();
			}
			drawer.canvas.renderAll();
		}

		drawer.mouseUp= function(o){

			// drawer.isDown = false;

			// if (drawer.rect.width > 15 && drawer.rect.height > 15) {
			// 	drawer.canvas.add(drawer.rect);
			// 	createItemToBoundingBoxes(drawer.canvas, document.getElementById("label").textContent);
			// }
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
}


export {DrawQuadrilateral};