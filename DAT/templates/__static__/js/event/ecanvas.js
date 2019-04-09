import {Color} from '../style/color'
var Direction = {
	LEFT: 0,
	UP: 1,
	RIGHT: 2,
	DOWN: 3
};

var zoomLevel = 0;
var zoomLevelMin = 0;
var zoomLevelMax = 3;

var shiftKeyDown = false;
var mouseDownPoint = null;

const init_ecanvas = function(canvas, popupControllers){
	
	canvas.on({
		'object:scaling': function(e) {
			document.getElementById("groupcontrol").style["display"] = "none";
			var obj = e.target,
			width = obj.width,
			height = obj.height,
			scaleX = obj.scaleX,
			scaleY = obj.scaleY;
			obj.set({
				width : width * scaleX,
				height : height * scaleY,
				scaleX: 1,
				scaleY: 1
			}); 

		},
		'mouse:over': function(e){
			var obj = e.target;

			if (obj){
				if (obj.type != "circle"){
					obj.set('fill', Color.Opacity_GREEN);
					var iitem = canvas.getObjects().indexOf(obj);
					var current_element = document.getElementById("itembb_"+iitem);
					var icheckbox = current_element.firstElementChild.children[2].firstElementChild;

				//bug moving polygon without circle on edit
				if(obj.type!='polygon'){
					obj.selectable = icheckbox.checked;
				}
				else{
					obj.selectable = false;
				}
				
				popupControllers.popup(obj);
			}
		}
		canvas.renderAll();
	},
	'mouse:out': function(e){
		try {
			if (e.target.type != "circle"){
				e.target.set('fill', Color.Transparent);
				canvas.renderAll();	
			}
		}
		catch(error) {
			
		}
	},
	'object:selected': function(e){
		if(e.target.type != "circle"){
			// var iitem = canvas.getObjects().indexOf(e.target);
			popupControllers.popup(e.target);
		}
	},
	'mouse:down': function(e){
		if(!canvas.getActiveObject())
		{
			document.getElementById("groupcontrol").style["display"] = "none";
		}
		//ZOOM PART
		var pointer = canvas.getPointer(e.e, true);
		mouseDownPoint = new fabric.Point(pointer.x, pointer.y);

	},
	'mouse:up': function(e){
		//ZOOM PART
		mouseDownPoint = null;
	},
	'mouse:move': function(e){
		//ZOOM PART
		if (shiftKeyDown && mouseDownPoint) {
			var pointer = canvas.getPointer(e.e, true);
			var mouseMovePoint = new fabric.Point(pointer.x, pointer.y);
			canvas.relativePan(mouseMovePoint.subtract(mouseDownPoint));
			mouseDownPoint = mouseMovePoint;
			keepPositionInBounds(canvas);
		}
	},
	'object:modified': function(e){
		if(e.target.type != "circle"){
			// var iitem = canvas.getObjects().indexOf(e.target);
			popupControllers.popup(e.target);
		}
	},
	'object:moving': function(e){
		document.getElementById("groupcontrol").style["display"] = "none";
	},});

	//===================BEGIN ZOOM PART======================//

	function getWheelDelta(event) {
		return event.wheelDelta || -event.detail || event.originalEvent.wheelDelta || -event.originalEvent.detail || -(event.originalEvent.deltaY * 25) || null;
	}

	const MouseWheelHandler = function(options){
		document.getElementById("groupcontrol").style["display"] = "none";
		var delta = getWheelDelta(options);
		if (delta != 0) {
			var pointer = canvas.getPointer(options.e, true);
			var point = new fabric.Point(pointer.x, pointer.y);
			if (delta > 0) {
				zoomIn(point);
			} else if (delta < 0) {
				zoomOut(point);
			}
		}
	}

	function move(direction) {
		switch (direction) {
			case Direction.LEFT:
			canvas.relativePan(new fabric.Point(-10 * canvas.getZoom(), 0));
			break;
			case Direction.UP:
			canvas.relativePan(new fabric.Point(0, -10 * canvas.getZoom()));
			break;
			case Direction.RIGHT:
			canvas.relativePan(new fabric.Point(10 * canvas.getZoom(), 0));
			break;
			case Direction.DOWN:
			canvas.relativePan(new fabric.Point(0, 10 * canvas.getZoom()));
			break;
		}
		keepPositionInBounds(canvas);
	}


	function zoomIn(point) {
		if (zoomLevel < zoomLevelMax) {
			zoomLevel++;
			canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
			keepPositionInBounds(canvas);
		}
	}

	function zoomOut(point) {
		if (zoomLevel > zoomLevelMin) {
			zoomLevel--;
			canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
			keepPositionInBounds(canvas);
		}
	}

	function keepPositionInBounds() {
		var zoom = canvas.getZoom();
		var xMin = (2 - zoom) * canvas.getWidth() / 2;
		var xMax = zoom * canvas.getWidth() / 2;
		var yMin = (2 - zoom) * canvas.getHeight() / 2;
		var yMax = zoom * canvas.getHeight() / 2;

		var point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
		var center = fabric.util.transformPoint(point, canvas.viewportTransform);

		var clampedCenterX = clamp(center.x, xMin, xMax);
		var clampedCenterY = clamp(center.y, yMin, yMax);

		var diffX = clampedCenterX - center.x;
		var diffY = clampedCenterY - center.y;

		if (diffX != 0 || diffY != 0) {
			canvas.relativePan(new fabric.Point(diffX, diffY));
		}
	}

	function clamp(value, min, max) {
		return Math.max(min, Math.min(value, max));
	}

	fabric.util.addListener(document.body, 'keydown', function(options) {
		if (options.repeat) {
			return;
		}
		document.getElementById("groupcontrol").style["display"] = "none";
		var key = options.which || options.keyCode; // key detection
		if (key == 32) { // handle Shift key
			canvas.defaultCursor = 'move';
			canvas.selection = false;
			shiftKeyDown = true;
		} else if (key === 37) { // handle Left key
			move(Direction.LEFT);
		} else if (key === 38) { // handle Up key
			move(Direction.UP);
		} else if (key === 39) { // handle Right key
			move(Direction.RIGHT);
		} else if (key === 40) { // handle Down key
			move(Direction.DOWN);
		}
	});

	fabric.util.addListener(document.body, 'keyup', function(options) {
		var key = options.which || options.keyCode; // key detection
		if (key == 32) { // handle Shift key
			canvas.defaultCursor = 'default';
			canvas.selection = true;
			shiftKeyDown = false;
		}
	});


	var cv_container = document.getElementsByClassName('canvas-container')[0];

	if (cv_container.addEventListener) {
    	// IE9, Chrome, Safari, Opera
    	cv_container.addEventListener("mousewheel", MouseWheelHandler, false);
    	// Firefox
    	cv_container.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else {
    	cv_container.attachEvent("onmousewheel", MouseWheelHandler);
    }

    //===================BEGIN ZOOM PART======================//
	//
}

export {init_ecanvas};

