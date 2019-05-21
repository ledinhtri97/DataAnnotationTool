import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import MedicalGrid from './medical-grid';
import Grid from '@material-ui/core/Grid';
import { isAbsolute } from 'path';
import { privateEncrypt } from 'crypto';

const styles = theme => ({
	appBarSpacer: theme.mixins.toolbar,
	content: {
		
		flexGrow: 1,
		padding: '0px', //padding: theme.spacing.unit * 2,
		width: '100%',
		height: '100%',
		overflow: 'auto',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	firstcontainer:{
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: "0px",
	},
	secondcontainer:{
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	canvas:{
		boxShadow: "0 5px 10px rgba(0, 0, 0, 0.35),0 5px 7px rgba(0, 0, 0, 0.24)",
	},
	label:{
		backgroundColor: "#FFFFFF",
		color: "#0844a7",
		paddingLeft: "3px",
		fontSize: '1rem',
	},
    hidden: {
    	display: 'none',
    },
	
	gridcontainer: {
		position: "absolute",
		top: 0,
	},
});

class MedicalLabeling extends React.Component {

	state = {
		something: null,
		data: 
		[
			{
				"canvas_id": "canvas_0",
				"float_position": "right"
			},
			{
				"canvas_id": "canvas_1",
				"float_position": "left"
			},
			{
				"canvas_id": "canvas_2",
				"float_position": "right"
			},
			{
				"canvas_id": "canvas_3",
				"float_position": "left"
			}
		]
	};

	contextMenu = function(e) {
    	e.preventDefault();
    	return false;
	};

	componentDidMount() {
		let canvas = document.getElementById("canvas_0").getElementsByTagName("canvas")[0];
		let ctx = canvas.getContext('2d');
		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		console.log(imgData);
		
		wait_opencvjs_to_exec(function(data) {
			let src = cv.imread(data.canvas); // read canvas element or id
			let dst = new cv.Mat();
			console.log(src);

			let s = new cv.Scalar(255, 0, 0, 255);
			cv.copyMakeBorder(src, dst, 10, 10, 10, 10, cv.BORDER_CONSTANT, s);
			cv.imshow(data.canvas, dst);
			src.delete();
			dst.delete();
			
		}, {canvas: canvas});

		/*let src = cv.imread(canvas); // read canvas element or id
		let dst = new cv.Mat();*/
		
		/*// You can try more different parameters
		let s = new cv.Scalar(255, 0, 0, 255);
		cv.copyMakeBorder(src, dst, 10, 10, 10, 10, cv.BORDER_CONSTANT, s);
		cv.imshow(canvas, dst);
		src.delete();
		dst.delete();*/
	};

	render() {

		const { classes } = this.props;
		
		return (
			<main className={classes.content}>
			
			<div className={classes.firstcontainer}>
				<div className={classes.secondcontainer} id="cvcontainer" onContextMenu={this.contextMenu}>
					{/*<canvas id="canvas_0" className={classes.canvas}></canvas>
                    <canvas id="canvas_1" className={classes.canvas}></canvas>
                    <canvas id="canvas_2" className={classes.canvas}></canvas>
					<canvas id="canvas_3" className={classes.canvas}></canvas>*/}

					<Grid container id="medicalGridContainer" className={classes.root} className={classes.gridcontainer} spacing={Number('8')}>
						{this.state.data.map((canvas_obj, i) => <MedicalGrid key = {i} 
						data = {canvas_obj} />)}
					</Grid>

					<div id="group_control" style={{display: 'none', position: 'absolute',}}>
						{<label id="label_popup" className={classes.label}></label>}
						{<label id="accuracy_popup" className={classes.label}></label>}
					</div>
					<div id="image_zoom" style={{display: 'none', position: 'absolute',}}></div>
				</div>
				<div className={classes.hidden}>
					<span id="show_popup"></span>
					<span id="show_label"></span>
					<span id="auto_hidden"></span>
					<span id="ask_dialog"></span>
					<span id="color_background"></span>
					<span id="size_icon"></span>
					<span id="width_stroke"></span>
				</div>
			</div>
			</main>
			);
	}
}

MedicalLabeling.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedicalLabeling);