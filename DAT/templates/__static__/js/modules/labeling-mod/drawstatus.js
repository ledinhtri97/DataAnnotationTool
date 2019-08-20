
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
		this.modeTool = ""; //edit, hidden, delete, change mode ===> default is false
		this.activePolygons = {'zs': false};
		this.factor = 1; //width, height
		this.turnRL = true;
	};

	getFactor(){
		return this.factor;
	}

	setFactor(factor){
		this.factor = factor;
	}

	getActivePolygons(){
		return this.activePolygons;
	};

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

	getModeTool() {
		return this.modeTool;
	}

	setModeTool(imode){
		this.modeTool = imode;
	}

	getRenewLabel(){
		return this.renewlabel;
	}

	setRenewLabel(value) {
		this.renewlabel = value;
	}

	setRenewLabel(value) {
		this.renewlabel = value;
	}

	setTurnRenewLabel(value) {
		this.turnRL = value;
	}

	getTurnRenewLabel() {
		return this.turnRL;
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
		return strokeWidth_id ? parseInt(strokeWidth_id.textContent) * this.factor : 2;
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
		this.modeTool = "";
	}
}

export default DrawStatus;