
class DrawStatus{
	constructor(){
		this.listLabelRect = null;
		this.listLabelPoly = null;
		this.isChangingLabel = false;
		this.isDrawing = false;
		this.isWaiting = false;
		this.isZoom = false;
		this.idTool = '';
		this.namelabel = '';
		this.colorlabel = "#F4D03F";
		this.typelabel = '';
		this.renewlabel = true;
		this.zoomSpaceKey = false;
		this.popupHover = false;
		this.modeTool = [0, 0, 0, 0]; //edit, hidden, delete, change mode ===> default is false
		this.activePolygons = {'zs': false};
	}

	getActivePolygons(){
		return this.activePolygons;
	}

	setListLabel(rectList, polyList) {
		this.listLabelRect = rectList;
		this.listLabelPoly = polyList;
	};

	getListLabelRect(){
		return this.listLabelRect;
	};

	getListLabelPoly(){
		return this.listLabelPoly;
	};

	getIsChangingLabel(){
		return this.isChangingLabel;
	}

	setIsChangingLabel(val){
		this.isChangingLabel = val;
	}

	getModeTool(imode=null) {
		if(imode != null) return this.modeTool[imode];
		
		let i = 0;
		for(i; i < this.modeTool.length; i++){
			if(this.modeTool[i]===1){ return i; }
		}
		return -1;
	}

	setModeTool(imode=-1){
		let i = 0;
		for(i; i < this.modeTool.length; i++){
			if(imode === i){ this.modeTool[i] = 1; }
			else{ this.modeTool[i] = 0; }
		}
	}

	setModeToolOff(imode){
		this.modeTool[imode] = 0;
	}

	getRenewLabel(){
		return this.renewlabel;
	}

	setRenewLabel(value) {
		this.renewlabel = value;
	}

	getNameLabel(){
		return this.namelabel;
	}

	setNameLabel(value=''){
		return this.namelabel = value;
	}

	getColorLabel(){
		return this.colorlabel;
	}

	setColorLabel(value){
		return this.colorlabel = value;
	}

	getStrokeLabel(){
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

	startDrawStatus(){
		this.isDrawing = true;
		this.isWaiting = true;
	}

	stopDrawStatus(){
		this.isDrawing = false;
		this.isWaiting = false;
	}

	resetDrawStatus(){
		this.isChangingLabel = false;
		this.isDrawing = false;
		this.isWaiting = false;
		this.isZoom = false;
		this.idTool = '';
		this.namelabel = '';
		this.colorlabel = "#F4D03F";
		this.typelabel = '';
		this.renewlabel = true;
		this.zoomSpaceKey = false;
		this.popupHover = false;
		this.modeTool = [0, 0, 0, 0];
	}
}

export default DrawStatus;