var gooutmain_1 = document.getElementById("gooutmain_workspace");
var gooutmain_2 = document.getElementById("gooutmain_logout");


var i = document.getElementById("metaid");
gooutmain_1.addEventListener('click', function(){
	if(!i){
		window.location.href = gooutmain_1.formAction;
	}
});


gooutmain_2.addEventListener('click', function(){
	if(!i){
		window.location.href = gooutmain_2.formAction;
	}
});