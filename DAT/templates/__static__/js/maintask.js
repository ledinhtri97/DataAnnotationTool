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

groupcontrol && groupcontrol.addEventListener('mouseover', function(e){
	groupcontrol.style["display"] = "";
});

groupcontrol && groupcontrol.addEventListener('mouseout', function(e){
	groupcontrol.style["display"] = "none";
});

const popupControllers = new PopupControllers(canvas);

init_event(canvas, popupControllers);

initMaintask(
	canvas, 
	document.getElementById('url_image').textContent,
	// document.getElementById("bbsfirst").textContent
);

//===================DEFAULT-INIT======================//
//

const metaid = document.getElementById("metaid");

//=======================API===========================//

var btnPredict = document.getElementById("predict_api");
var listPredict = [];

if (btnPredict){
	btnPredict.addEventListener('click', function(){
		var predict_bbs = document.getElementById("predict_bbs").textContent;
		try {
			if(listPredict.length == 0) {
				btnPredict.disabled = true;
				
				predict_bbs.split('\n').forEach(function(line){
					var info = line.split(',');
					if (info.length==5  || info.length==6){
						listPredict.push(renderBBS_RECT(canvas, info));	
					}
					else if (info.length==9 || info.length==10){
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
		btnPredict.disabled = false;	
		document.getElementById("groupcontrol").style["display"] = "none";
		rqbadnext(metaid.textContent, canvas);

	});
}

const btnNext = document.getElementById("next");

btnNext && btnNext.addEventListener('click', function(){
	listPredict.splice(0,listPredict.length);
	btnPredict.disabled = false;
			
	document.getElementById("groupcontrol").style["display"] = "none";
	rqnext(metaid.textContent, canvas);
});

const btnSaveandNext = document.getElementById("savennext");

btnSaveandNext && btnSaveandNext.addEventListener('click', function(){
	listPredict.splice(0,listPredict.length);
	btnPredict.disabled = false;
	
	document.getElementById("groupcontrol").style["display"] = "none";
	rqsavenext(metaid.textContent, canvas);
})

//=======================DRAWER=======================//
//

class DrawStatus{
	constructor(__isDrawing__){
		this.isDrawing = __isDrawing__;
		this.isWaiting = false;
	}

	setIsDrawing(__isDrawing__){
		this.isDrawing = __isDrawing__;
	}

	getIsDrawing(){
		return this.isDrawing;
	}

	setIsWaiting(_isWaiting_){
		this.isWaiting = _isWaiting_;
	}

	getIsWaiting(){
		return this.isWaiting;
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