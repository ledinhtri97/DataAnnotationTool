// import {createItemToBoundingBoxes} from '../controller/itemReact';
// import {configureRectangle} from '../drawer/polygon';

// const requestPersonAPI = function(meta_id, canvas){
// 	fetch("/gvlab-dat/workspace/persondet/"+meta_id, {metaid: meta_id})
// 	.then(response => {
// 		if(response.status !== 200){
// 			return "Something went wrong"
// 		}
// 		return response.json();
// 	})
// 	.then(data => {
// 		data['resAPI'].map(function(face, index){
// 			var width = canvas.width;
// 			var height = canvas.height;

// 			var bbface = configureRectangle(
// 					width*face.xmin, 
// 					height*face.ymin,
// 					width*(face.xmax-face.xmin),
// 					height*(face.ymax-face.ymin),
// 					'person');
// 			canvas.add(bbface);
// 			canvas.renderAll();

// 			createItemToBoundingBoxes(canvas, 'person');
// 	});
// });}

// export {requestPersonAPI};