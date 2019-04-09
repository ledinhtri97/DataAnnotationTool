import {fabric} from 'fabric';
import {requestFaceAPI} from "./api/faceRequest";
import {requestPersonAPI} from "./api/personRequest";
import {requestNextMetaData} from "./controller/next";
import {requestSaveAndNext} from  "./controller/saveNnext"
import {initMaintask, outWorkSpace} from "./controller/renderInit"
import {DrawRectangle} from "./drawer/rectangle"
import {DrawPolygon} from "./drawer/polygon"
import {AllCheckBoxEdit, AllCheckBoxHidden} from "./controller/itemReact";
import {Color} from "./style/color"
import {PopupControllers} from "./controller/popup";
import {init_ecanvas} from "./event/ecanvas"

var formSubmitting = false;
var setFormSubmitting = function() { formSubmitting = true; };

window.onload = function() {
    window.addEventListener("beforeunload", function (e) {
        // if (formSubmitting) {
        //     return undefined;
        // }

        var confirmationMessage = 'Có vẻ như bạn đang chỉnh sửa một số thứ. '
                                + 'Nếu bạn rời khỏi hay tải lại trang hiện tại trước khi lưu dữ liệu. Dữ liệu có thể sẽ mất';

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });
};

// var Direction = {
// 	LEFT: 0,
// 	UP: 1,
// 	RIGHT: 2,
// 	DOWN: 3
// };

// var zoomLevel = 0;
// var zoomLevelMin = 0;
// var zoomLevelMax = 3;

// var shiftKeyDown = false;
// var mouseDownPoint = null;

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

init_ecanvas(canvas, popupControllers);

initMaintask(
	canvas, 
	document.getElementById('imgurl').href, 
	document.getElementById("bbsfirst").textContent
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



//=====================CONTROLER=======================//
//
const btnNext = document.getElementById("next");

btnNext.addEventListener('click', function(){
	document.getElementById("groupcontrol").style["display"] = "none";
	requestNextMetaData(metaid.textContent, canvas);
});

const btnSaveandNext = document.getElementById("savennext");

btnSaveandNext.addEventListener('click', function(){
	document.getElementById("groupcontrol").style["display"] = "none";
	requestSaveAndNext(metaid.textContent, canvas);
})

//=======================DRAWER=======================//
//

const drawRect = new DrawRectangle(canvas);
const drawPoly = new DrawPolygon(canvas);
var labelSelector = document.getElementById("labelSelect");
var label = document.getElementById("label");
var btnEnd = document.getElementById("end");

Array.from(labelSelector.children).forEach(function(elem) {
	elem.addEventListener('click', function(){
		var spl = elem.textContent.split('-');
		// var labelname = spl[0];
		// var labeltype = spl[1];
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


// var quad = document.getElementById("quad");
// quad.addEventListener('click', function(o){
// 	drawQuad.startDraw();
// });

// btnEnd.addEventListener('click', function(o){
// 	drawRect.endDraw();
// 	drawQuad.endDraw();
// });

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
	elem.addEventListener('click', function(){
		var spl = elem.textContent.split('-');
		// var labelname = spl[0];
		// var labeltype = spl[1];
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

export {drawRect, drawPoly, canvas};