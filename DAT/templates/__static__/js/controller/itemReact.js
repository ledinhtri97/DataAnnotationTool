import {LabelControl} from "./label";
import React from "react";
import ReactDOM from "react-dom";
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

class ElementITEM extends React.Component{

	render(){

		var labelControl = new LabelControl(this.props.canvas, this.props.objshape);
		var namelabel = this.props.namelabel;

		return React.createElement("form", {
			onMouseEnter: function(){labelControl.__overITEM__()},
			onMouseLeave: function(){labelControl.__outITEM__()},
		}, 
		React.createElement("label", null, namelabel), 
		React.createElement("span", null,
			React.createElement("input", {
				type: "checkbox",
				onChange: function(e){labelControl.__hiddenITEM__()}
			}), React.createElement("label", {
			}, "Hidden")), 
		React.createElement("span", null,
			React.createElement("input", {
				type: "checkbox",
				onChange: function(e){labelControl.__eventedITEM__()}
			}), React.createElement("label", {
			}, "Enable")), 
		React.createElement("input", {
			type: "button",
			style: {
				backgroundImage: "url(/gvlab-dat/static/images/delete.png)",
				backgroundPosition: 'center',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat'
			},
			onClick: function(e){labelControl.__deleteITEM__()}
		}));
	}
}

const createItemToBoundingBoxes = function (canvas, namelabel, __iitem__=-1){
	
	var bbs_available = document.getElementById("bbs_available");
	var new_element =  document.createElement("div");
	new_element.className = "itembb";

	if(__iitem__==-1){
		var iitem = canvas.getObjects().length - 1;
		var objshape = canvas.item(iitem);
		new_element.id = "itembb_"+iitem;
		bbs_available.appendChild(new_element);
	}
	else{
		var objshape = canvas.item(__iitem__);
		new_element.id = "itembb_"+__iitem__;
		if (__iitem__ == 0){
			bbs_available.insertBefore(new_element, bbs_available.firstElementChild);
		}
		else{
			if (bbs_available.childElementCount){

				var mindis = 999999;
				var __id__ = '';

				Array.from(bbs_available.children).forEach(function(elem) {
					var id = elem.id.split('_')[1];

					var tem = Math.abs(id-__iitem__);
					if(tem< mindis){
						__id__ = id;
						mindis = tem;
					}
				});

				var __elem__ = document.getElementById("itembb_"+__id__);

				if(__id__ < __iitem__){
					bbs_available.insertBefore(new_element, __elem__.nextSibling);	
				}
				else{
					bbs_available.insertBefore(new_element, __elem__);		
				}

				
			}
			else{
				bbs_available.appendChild(new_element);
			}
		}
		try {
			if(new_element.nextSibling && new_element.nextSibling.id == new_element.id){
				bbs_available.removeChild(new_element.nextSibling);
			}
		} catch(e) {
			console.log(e);
		}
	}
	ReactDOM.render(<ElementITEM canvas={canvas} objshape={objshape} namelabel={namelabel}/>, new_element);
}

const AllCheckBoxEdit = function(canvas, value){
	var bbs_available = document.getElementById("bbs_available");
	Array.from(bbs_available.children).forEach(function(elem) {
		var icheckbox = elem.firstElementChild.children[2].firstElementChild;
		if(icheckbox.checked!=value){
			icheckbox.checked = value;
			var iitem = parseInt(elem.id.split('_')[1]);
			var wrapper = shallow(<ElementITEM canvas={canvas} objshape={canvas.item(iitem)}/>);
			wrapper.find(
				'input[type="checkbox"]'
				).at(1).simulate('change',{ target: { checked: icheckbox.checked } });
		}
	});
}

const AllCheckBoxHidden = function(canvas, value){
	var type_get_all_checkbox = value? "bbs_available" : "bbs_hidden";
	var bbs_select = document.getElementById(type_get_all_checkbox);

	Array.from(bbs_select.children).forEach(function(elem) {
		var icheckbox = elem.firstElementChild.children[1].firstElementChild;
		icheckbox.checked = value;
		var iitem = parseInt(elem.id.split('_')[1]);
		var wrapper = shallow(<ElementITEM canvas={canvas} objshape={canvas.item(iitem)}/>);
		wrapper.find(
			'input[type="checkbox"]'
			).at(0).simulate('change',{ target: { checked: icheckbox.checked } });

	});
}

const DeleteAll = function(__canvas__){
	__canvas__.getObjects().forEach(function(elem){
		var wrapper = shallow(<ElementITEM canvas={__canvas__} objshape={elem} />);
		wrapper.find('input[type="button"]').simulate('click');
		document.getElementById("groupcontrol").style["display"] = "none";
	});
}

export {DeleteAll, AllCheckBoxEdit, AllCheckBoxHidden, ElementITEM, createItemToBoundingBoxes};