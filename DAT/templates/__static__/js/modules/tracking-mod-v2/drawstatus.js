
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
		this.labelTrackingManagement = {};
		this.autoSynchs = {
			_t: false,
			_b: false,
		};
		this.linkLabels = null;
		this.activeCopyAll = true;
	};

	getActiveCopyAll(){
		return this.activeCopyAll;
	}

	setActiveCopyAll(v){
		this.activeCopyAll = v;
	}

	getLinkLabels() {
		return this.linkLabels;
	}

	resetLinkLabels(out=false) {

		if (!this.linkLabels) return;

		this.linkLabels.labelControl.__controlIsLinkLabel__();
		if (out) {
			this.linkLabels.labelControl.__outITEM__();
		}
		this.linkLabels = null;
	}

	releaseLinkLabels(obj) {
		let sp_from = this.linkLabels.labelControl.getId().split('_'); // [id, pos]
		let id_from = sp_from[0], pos_from = '_'+sp_from[1];
		let sp_to = obj.labelControl.getId().split('_'); // [id, pos]
		let id_to = sp_to[0], pos_to = '_'+sp_to[1];

		if (
			id_from == id_to || 
			pos_from == pos_to || 
			this.linkLabels.type_label != obj.type_label || 
			this.linkLabels.name != obj.name) {
				obj.labelControl.__controlIsLinkLabel__();
				this.resetLinkLabels(true);
		}
		else {
			
			let preObjectTo = this.getOneFromLTM(id_from, pos_to);
			if (preObjectTo) {
				alert("Id of object had already existed!");
				obj.labelControl.__controlIsLinkLabel__();
				this.resetLinkLabels(true);
				return;
				// preObjectTo.labelControl.__deleteITEM__();
			}

			let preLinkObjectsTo = this.getObjectsLTM(id_to);

			for (let pos in preLinkObjectsTo) {
				preLinkObjectsTo[pos].labelControl.__outITEM__();
			}

			if (Object.keys(preLinkObjectsTo).length == 1) {
				this.removeAllFromLTM(id_to);
			}
			else if (preLinkObjectsTo[pos_to]){
				this.removeOneFromLTM(id_to, pos_to);
			}

			obj.labelControl.setId(id_from+pos_to);
			this.pushOneToLTM(id_from, pos_to, obj);

			obj.labelControl.__controlIsLinkLabel__();
			this.resetLinkLabels();

			let preLinkObjectsFrom = this.getObjectsLTM(id_from);
			let sizeObjs = Object.keys(preLinkObjectsFrom).length;

			for (let pos in preLinkObjectsFrom) {
				preLinkObjectsFrom[pos].labelControl.__overITEM__();
				if (sizeObjs == 2) {
					setTimeout(function(){
						if(!preLinkObjectsFrom[pos].labelControl.getIsHidden()){
							preLinkObjectsFrom[pos].labelControl.__hiddenITEM__();
						}
					}, 500)
				}
			}
		}
	}

	pushLinkLabels(obj) {
		if (this.linkLabels) {
			this.releaseLinkLabels(obj);
		}
		else {
			this.linkLabels = obj;	
		}
	}

	setAutoSynch(pos, value){
		this.autoSynchs[pos] = value;
	}

	getAutoSynchs(pos){
		return pos ? this.autoSynchs[pos] : this.autoSynchs;
	}

	getObjectsLTM(id) {
		return this.labelTrackingManagement[id];
	}

	getOneFromLTM(id, pos) {
		return this.labelTrackingManagement[id][pos];
	}

	pushOneToLTM(id, pos, obj){
		if (!this.labelTrackingManagement[id]) {
			this.labelTrackingManagement[id] = {};
		}
		this.labelTrackingManagement[id][pos] = obj;
	}

	pushObjectsToLTM(id, fObjects) {
		this.labelTrackingManagement[id] = fObjects;
	}

	removeAllFromLTM(id) {
		delete this.labelTrackingManagement[id];
	}

	removeOneFromLTM(id, pos) {
		delete this.labelTrackingManagement[id][pos];
	}

	resetLTM() {
		this.labelTrackingManagement = {};
	}

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

	setTurnRenewLabel(value) {
		this.turnRL = value;
	}

	getTurnRenewLabel(){
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
		if (this.modeTool != "linkLabel_tool"){
			this.modeTool = "";
		}
	}
}

export default DrawStatus;