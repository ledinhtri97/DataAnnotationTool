
class DrawStatus{
	constructor(){
		this.isDrawing = false;
		this.isWaiting = false;
		this.isZoom = false;
		this.idTool = '';
		this.zoomSpaceKey = false;
		this.popupHover = false;
	}

	setIsDrawing(__isDrawing__){
		this.isDrawing = __isDrawing__;
	}

	getPopuHover(){
		return this.popupHover;
	}

	setPopuHover(__popupHover__){
		this.popupHover = __popupHover__;
	}

	getIsDrawing(){
		return this.isDrawing;
	}

	setIsWaiting(__isWaiting___){
		this.isWaiting = __isWaiting___;
	}

	getIsWaiting(){
		return this.isWaiting;
	}

	setIdTool(__idTool__){
		this.idTool = __idTool__;
	}

	setIsZoom(__isZoom__){
		this.isZoom = __isZoom__;
	}

	getIsZoom(){
		return this.isZoom;
	}

	setZoomSpaceKey(__zoomSpace__){
		this.zoomSpaceKey = __zoomSpace__;
	}

	getZoomSpaceKey(){
		return this.zoomSpaceKey;
	}

	startDrawStatus(__idTool__){
		this.isDrawing = true;
		this.isWaiting = true;
		this.idTool = __idTool__;
		var currentTool = document.getElementById(this.idTool);
		if (currentTool) currentTool.style['backgroundColor'] = "#ADE4FF";
	}

	stopDrawStatus(){
		this.isDrawing = false;
		this.isWaiting = false;
		var currentTool = document.getElementById(this.idTool);
		if (currentTool) currentTool.style['backgroundColor'] = "#FFFFFF";
		this.idTool = '';
	}
}

export default DrawStatus;