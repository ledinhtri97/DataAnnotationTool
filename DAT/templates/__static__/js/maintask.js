import {fabric} from 'fabric';
import {requestFaceAPI} from "./api/faceRequest";
import {requestPersonAPI} from "./api/personRequest";
import {outWorkSpace} from "./modules/dat-utils"
import {rqnext, rqsavenext, rqbadnext} from  "./controller/request"
import {initMaintask, renderBBS_RECT, renderBBS_POLY} from "./controller/renderInit"
import {DrawPolygon} from "./drawer/polygon"
import {AllCheckBoxEdit, AllCheckBoxHidden, DeleteAll} from "./controller/itemReact";
import {Color} from "./style/color"
import {PopupControllers} from "./controller/popup";
import {init_event} from "./event/einit"

const canvas = new fabric.Canvas('canvas', {
	hoverCursor: 'pointer',
	selection: true,
	selectionBorderColor: Color.GREEN,
	backgroundColor: null,
	uniScaleTransform: true,
});

const groupcontrol =  document.getElementById("groupcontrol");

if(groupcontrol) groupcontrol.addEventListener('mouseover', function(e){
	groupcontrol.style["display"] = "";
});

if(groupcontrol) groupcontrol.addEventListener('mouseout', function(e){
	groupcontrol.style["display"] = "none";
});

const popupControllers = new PopupControllers(canvas);
popupControllers.setPopup(true);

init_event(canvas, popupControllers);

initMaintask(
	canvas, 
	document.getElementById('url_image').textContent,
);

//===================DEFAULT-INIT======================//
//

const meta_id = document.getElementById("meta_id");

//=======================API===========================//

var btnPredict = document.getElementById("predict_api");
var listPredict = [];

if (btnPredict){
	btnPredict.addEventListener('click', function(){
		var predict_bbs = document.getElementById("predict_bbs").textContent;
		var boxes_position = document.getElementById("boxes_position").textContent;
		var bbs = predict_bbs ? predict_bbs : boxes_position;
		try {
			if(listPredict.length == 0) {
				btnPredict.style['display'] = 'none';
				
				bbs.split('\n').forEach(function(line){
					var info = line.split(',');
					if (info.length==5  || info.length==6){
						if(info.length == 5){
							info.unshift("1.0");
						}
						listPredict.push(renderBBS_RECT(canvas, info));	
					}
					else if (info.length==9 || info.length==10){
						if(info.length == 9){
							info.unshift("1.0");
						}
						listPredict.push(renderBBS_POLY(canvas, info));
					}
				});
			}

		} catch(e) {
			console.log(e);
		}
	});
}

//=====================CONTROLER=======================//
//

const btnBad = document.getElementById("bad_data");

if(btnBad){
	btnBad.addEventListener('click', function(){
		listPredict.splice(0,listPredict.length);
		btnPredict.style['display'] = '';	
		if(groupcontrol) groupcontrol.style["display"] = "none";
		rqbadnext(meta_id.textContent, canvas);

	});
}

const btnNext = document.getElementById("skip_next");

btnNext && btnNext.addEventListener('click', function(){
	listPredict.splice(0,listPredict.length);
	btnPredict.style['display'] = '';
			
	if(groupcontrol) groupcontrol.style["display"] = "none";
	rqnext(meta_id.textContent, canvas);
});

const btnSaveandNext = document.getElementById("save_next");

btnSaveandNext && btnSaveandNext.addEventListener('click', function(){
	listPredict.splice(0,listPredict.length);
	btnPredict.style['display'] = '';
	
	if(groupcontrol) groupcontrol.style["display"] = "none";
	rqsavenext(meta_id.textContent, canvas);
})

//=======================DRAWER=======================//
//

class DrawStatus{
	constructor(__isDrawing__){
		this.isDrawing = __isDrawing__;
		this.isWaiting = false;
		this.isZoom = false;
		this.idTool = '';
		this.zoomSpaceKey = false;
	}

	setIsDrawing(__isDrawing__){
		this.isDrawing = __isDrawing__;
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

const drawStatus = new DrawStatus(false);
const drawPoly = new DrawPolygon(canvas);

var btnStopDrawing = document.getElementById("stop_draw");

// var labelSelector = document.getElementById("labelSelect");
// labelSelector && Array.from(labelSelector.children).forEach(function(elem) {
// 	elem.addEventListener('click', function(){
// 		var spl = elem.textContent.split('-');
// 		drawPoly.setType(spl[1]);
// 		drawPoly.startDraw(spl[0]);
// 	});
// });

btnStopDrawing && btnStopDrawing.addEventListener('click', function(o){
	drawPoly.endDraw();
});

var tabletask = document.getElementById("tabletask");
var selectPopup = document.getElementById("selectpopup");
var labelselect = document.getElementById("label_select");

tabletask && tabletask.addEventListener('contextmenu', function(ev) {
	ev.preventDefault();
	selectPopup.style['left'] = (ev.clientX+10)+"px";
	selectPopup.style['top'] = (ev.clientY-30)+"px";
	selectPopup.style["display"] = "";
	return false;
}, false);

labelselect && Array.from(labelselect.children).forEach(function(elem) {
	var spl = elem.textContent.split('-');
	// elem.addEventListener('click', function(){
	// 	drawPoly.setType(spl[1]);
	// 	drawPoly.startDraw(spl[0]);
	// });
	var elemTool = document.getElementById(elem.textContent);
	elemTool.addEventListener('click', (function(event) {
		drawPoly.setType(spl[1]);
		drawPoly.startDraw(spl[0]);
	}));
});

tabletask && tabletask.addEventListener("click", (function(event) {
	selectPopup.style["display"] = "none";
}));


var hiddenAll = document.getElementById("hall");
var editAll = document.getElementById("eall");

hiddenAll && hiddenAll.addEventListener('change', function(){
	AllCheckBoxHidden(canvas, hiddenAll.checked);
});

editAll && editAll.addEventListener('change', function(){
	AllCheckBoxEdit(canvas, editAll.checked);
});


var deleteall = document.getElementById("deleteall");
if (deleteall){
	deleteall.addEventListener('click', function(){
		DeleteAll(canvas);
	});
}

//BONUS

export {drawPoly, drawStatus, listPredict, canvas};