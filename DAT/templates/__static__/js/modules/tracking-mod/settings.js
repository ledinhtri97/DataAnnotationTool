
class QuickSettings{

	getAtt(att){
		var value = document.getElementById(att).textContent;
		return value == 'false' ? false : value == 'true' ? true : value;
	}

	setAtt(att, val){
		document.getElementById(att).textContent = val;
	}
}


export default QuickSettings;