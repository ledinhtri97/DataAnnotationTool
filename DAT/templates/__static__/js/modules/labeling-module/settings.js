
class QuickSettings{
	
	constructor(){
		// show_popup
		// auto_hidden
		// auto_predict
		// ask_dialog
		// color_background
		// width_stroke
	}

	getAtt(att){
		var value = document.getElementById(att).textContent;
		return value == 'false' ? false : value == 'true' ? true : value;
	}

	setAtt(att, val){
		document.getElementById(att).textContent = val;
	}
}


export default QuickSettings;