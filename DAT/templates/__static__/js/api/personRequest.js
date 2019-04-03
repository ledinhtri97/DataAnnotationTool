import {createItemToBoundingBoxes, configRectangle} from '../controller/labelControl';

const requestPersonAPI = function(meta_id, canvas){
	fetch("/gvlab-dat/workspace/persondet/"+meta_id, {metaid: meta_id})
	.then(response => {
		if(response.status !== 200){
			return "Something went wrong"
		}
		return response.json();
	})
	.then(data => {
		data['faces'].map(function(face, index){
			var width = canvas.width;
			var height = canvas.height;

			var bbface = configRectangle(
					width*face.xmin, 
					height*face.ymin,
					width*(face.xmax-face.xmin),
					height*(face.ymax-face.ymin));
			canvas.add(bbface);
			canvas.renderAll();

			createItemToBoundingBoxes(canvas, 'person');
	});
});}

export {requestPersonAPI};