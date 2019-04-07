import {createItemToBoundingBoxes, AllCheckBoxEdit} from '../controller/itemReact';
import {fabric} from "fabric";

class DrawRectangle{
	constructor(__canvas__) {

		const drawer = this;
		drawer.canvas = __canvas__;
		drawer.mouseDown = function(o){
			drawer.isDown = true;
			var pointer = drawer.canvas.getPointer(o.e);
			drawer.origX = pointer.x;
			drawer.origY = pointer.y;
			var pointer = drawer.canvas.getPointer(o.e);
			drawer.rect = configureRectangle(
				drawer.origX,
				drawer.origY,
				pointer.x-drawer.origX,
				pointer.y-drawer.origY
				);
		}

		drawer.mouseMove= function(o){
			if (!drawer.isDown) return;
			var pointer = drawer.canvas.getPointer(o.e);

			if(drawer.origX>pointer.x){
				drawer.rect.set({ left: Math.abs(pointer.x) });
			}
			if(drawer.origY>pointer.y){
				drawer.rect.set({ top: Math.abs(pointer.y) });
			}

			drawer.rect.set({ width: Math.abs(drawer.origX - pointer.x) });
			drawer.rect.set({ height: Math.abs(drawer.origY - pointer.y) });

			drawer.canvas.renderAll();
		}

		drawer.mouseUp= function(o){
			drawer.isDown = false;

			if (drawer.rect.width > 15 && drawer.rect.height > 15) {
				drawer.canvas.add(drawer.rect);
				createItemToBoundingBoxes(drawer.canvas, document.getElementById("label").textContent);
			}
		}
	}

	startDraw(){
		AllCheckBoxEdit(this.canvas, false);
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

const configureRectangle = function (__left__, __top__, __width__, __height__){
	var rect = new fabric.Rect({
		left: __left__,
		top: __top__,
		width: __width__,
		height: __height__,

		originX: 'left',
		originY: 'top',
		hasBorder: true,
		stroke: 'blue',
		strokeWidth: 3,
		fill:'transparent',
		transparentCorners: true,
		cornerSize: 10,
		noScaleCache: false,
		// selectable: false,
		// evented: false,
	});
	
	rect.setControlVisible('mtr', false);
	rect.setControlVisible('ml', false);
	rect.setControlVisible('mt', false);
	rect.setControlVisible('mr', false);
	rect.setControlVisible('mb', false);

	return rect;
}

export {configureRectangle, DrawRectangle};