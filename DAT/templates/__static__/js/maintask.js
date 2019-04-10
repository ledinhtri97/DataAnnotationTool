import {fabric} from 'fabric';
import {requestFaceAPI} from "./api/faceRequest";
import {requestPersonAPI} from "./api/personRequest";
import {rqnext, rqsavenext, rqbadnext} from  "./controller/request"
import {initMaintask, outWorkSpace, renderBBS_RECT, renderBBS_POLY} from "./controller/renderInit"
import {DrawRectangle} from "./drawer/rectangle"
import {DrawPolygon} from "./drawer/polygon"
import {AllCheckBoxEdit, AllCheckBoxHidden, DeleteAll} from "./controller/itemReact";
import {Color} from "./style/color"
import {PopupControllers} from "./controller/popup";
import {init_event, labelHandle} from "./event/einit"

const canvas = new fabric.Canvas('canvas', {
	hoverCursor: 'pointer',
	selection: true,
	selectionBorderColor: Color.GREEN,
	backgroundColor: null,
	uniScaleTransform: true,
});

const groupcontrol =  document.getElementById("groupcontrol");

groupcontrol.addEventListener('mouseover', function(e){
	groupcontrol.style["display"] = "";
});

groupcontrol.addEventListener('mouseout', function(e){
	groupcontrol.style["display"] = "none";
});

const popupControllers = new PopupControllers(canvas);

init_event(canvas, popupControllers);

initMaintask(
	canvas, 
	document.getElementById('imgurl').href,
	// document.getElementById("bbsfirst").textContent
	);

//===================DEFAULT-INIT======================//
//

const metaid = document.getElementById("metaid");

//=======================API===========================//
//

// const btnFace = document.getElementById("facedet");

// if (btnFace){
// 	btnFace.addEventListener('click', function(){
// 		document.getElementById("groupcontrol").style["display"] = "none";
// 		requestFaceAPI(metaid.textContent, canvas);
// 	});
// }


// const btnPerson = document.getElementById("persondet");

// if (btnPerson){
// 	btnPerson.addEventListener('click', function(){
// 		document.getElementById("groupcontrol").style["display"] = "none";
// 		requestPersonAPI(metaid.textContent, canvas);
// 	});
// }

var btnPredict = document.getElementById("predictAPI");
var listPredict = [];

if (btnPredict){
	btnPredict.addEventListener('click', function(){
		var bbs = document.getElementById("bbsfirst").textContent
		try {
			if(listPredict.length == 0) {
				btnPredict.disabled = true;
				bbs.split('\n').forEach(function(line){
					var info = line.split(',');
					if (info.length==5){
						listPredict.push(renderBBS_RECT(canvas, info));	
					}
					else if (info.length==9){
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

const btnBad = document.getElementById("baddata");

if(btnBad){
	btnBad.addEventListener('click', function(){
		listPredict.splice(0,listPredict.length);
		btnPredict.disabled = false;	
		document.getElementById("groupcontrol").style["display"] = "none";
		rqbadnext(metaid.textContent, canvas);

	});
}

const btnNext = document.getElementById("next");

btnNext.addEventListener('click', function(){
	listPredict.splice(0,listPredict.length);
	btnPredict.disabled = false;
			
	document.getElementById("groupcontrol").style["display"] = "none";
	rqnext(metaid.textContent, canvas);
});

const btnSaveandNext = document.getElementById("savennext");

btnSaveandNext.addEventListener('click', function(){
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
	}

	setIsDrawing(__isDrawing__){
		this.isDrawing = __isDrawing__;
	}

	getIsDrawing(){
		return this.isDrawing;
	}
}

const drawStatus = new DrawStatus(false);
const drawRect = new DrawRectangle(canvas);
const drawPoly = new DrawPolygon(canvas);
var labelSelector = document.getElementById("labelSelect");
var label = document.getElementById("label");
var btnEnd = document.getElementById("end");

Array.from(labelSelector.children).forEach(function(elem) {
	elem.addEventListener('click', function(){
		var spl = elem.textContent.split('-');

		label.textContent = spl[0];
		if (spl[1] == 'rect'){
			drawPoly.endDraw();
			drawRect.endDraw();
			drawRect.startDraw();	
		}
		else if (spl[1] == 'quad'){
			drawRect.endDraw();
			drawPoly.endDraw();
			drawPoly.setisQuadrilateral(true);
			drawPoly.startDraw();
		}	
		else if (spl[1] == 'poly'){
			drawRect.endDraw();
			drawPoly.endDraw();
			drawPoly.setisQuadrilateral(false);
			drawPoly.startDraw();
		}
	});
});

btnEnd.addEventListener('click', function(o){
	drawRect.endDraw();
	drawPoly.endDraw();
	label.textContent = "NO LABEL";
});

var tabletask = document.getElementById("tabletask");
var selectPopup = document.getElementById("selectpopup");
var labelselect = document.getElementById("labelselect");

tabletask.addEventListener('contextmenu', function(ev) {
	ev.preventDefault();
	selectPopup.style['left'] = (ev.clientX+10)+"px";
	selectPopup.style['top'] = (ev.clientY-30)+"px";
	selectPopup.style["display"] = "";
	return false;
}, false);

Array.from(labelselect.children).forEach(function(elem) {
	var spl = elem.textContent.split('-');
	elem.addEventListener('click', function(){
		labelHandle(spl,true);
	});
});

tabletask.addEventListener("click", (function(event) {
	selectPopup.style["display"] = "none";
}));


var hiddenAll = document.getElementById("hall");
var editAll = document.getElementById("eall");

hiddenAll.addEventListener('change', function(){
	AllCheckBoxHidden(canvas, hiddenAll.checked);
});

editAll.addEventListener('change', function(){
	AllCheckBoxEdit(canvas, editAll.checked);
});


var deleteall = document.getElementById("deleteall");
if (deleteall){
	deleteall.addEventListener('click', function(){
		DeleteAll(canvas);
	});
}

//BONUS
//
//

var ws = document.getElementById("gooutmain_workspace");
var lo = document.getElementById("gooutmain_logout");

ws.addEventListener('click', function(){
	if(metaid){
		outWorkSpace(metaid.textContent, ws.formAction);
	}
	else {
		window.location.href = ws.formAction;
	}
});

lo.addEventListener('click', function(){
	if(metaid){
		outWorkSpace(metaid.textContent, lo.formAction);
	}
	else{
		window.location.href = lo.formAction;
	}
});

export {drawRect, drawPoly, drawStatus, listPredict, canvas};