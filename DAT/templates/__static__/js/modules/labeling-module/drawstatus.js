
class DrawStatus{
	constructor(){
		this.isDrawing = false;
		this.isWaiting = false;
		this.isZoom = false;
		this.idTool = '';
		this.namelabel = 'NO LABEL';
		this.zoomSpaceKey = false;
		this.popupHover = false;
	}

	getIdlabel(){
		return this.idTool;
	}

	getNamelabel(){
		return this.namelabel;
	}

	getColorlabel(){
		var color = document.getElementById(this.idTool+'_color')
		return color ? color.textContent : "#F4D03F";
	}

	getStrokelabel(){
		var strokeWidth_id = document.getElementById('width_stroke');
		return strokeWidth_id ? parseInt(strokeWidth_id.textContent) : 2;
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

	startDrawStatus(__idTool__, namelabel){
		this.isDrawing = true;
		this.isWaiting = true;
		if(__idTool__ && namelabel) {
			this.idTool = __idTool__;
			this.namelabel = namelabel;
		}
		var currentTool = document.getElementById(this.idTool);
		document.getElementById("label").textContent = this.namelabel;
		if (currentTool) currentTool.style['backgroundColor'] = "#ADE4FF";
	}

	stopDrawStatus(){
		this.isDrawing = false;
		this.isWaiting = false;
		var currentTool = document.getElementById(this.idTool);
		document.getElementById("label").textContent = "NO LABEL";
		if (currentTool) currentTool.style['backgroundColor'] = "#FFFFFF";
	}
}

export default DrawStatus;