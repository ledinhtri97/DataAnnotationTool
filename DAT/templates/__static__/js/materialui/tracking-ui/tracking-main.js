import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';

const styles = theme => ({
	appBarSpacer: theme.mixins.toolbar,
	content: {
		flexGrow: 1,
		width: '100%',
		height: '100%',
		overflow: 'auto',
	},
	firstcontainerFull: {
		width: '97%',
		height: '97%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	firstcontainerNoneFull: {
		width: '98%',
		height: '96%',
	},
	secondContainerCVLeft:{
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'relative',
	},
	secondContainerCVRight:{
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'flex-start',
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
    horizontal:{
    	width: '100%',
    	height: '50%',
    	display: 'flex',
    },
	vertical:{
		width: '50%',
    	height: '100%',
    	display: 'flex',
    	justifyContent: 'center',
		alignItems: 'center',
	},
	synchstyle:{
		top: '0',
		position: 'absolute',
    	zIndex: 1,
    	backgroundColor: 'rgba(255, 255, 255, 0.74)',
    	borderRadius: '4px',
	},
	noneFullView: {
		width: '100%',
		height: '100%',
	},
	fullView: {
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	generalSecondContainer: {
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
});

class Subframe extends React.Component{

	render(){

		const {classes, idframe} = this.props;
		let secondcontainer, firstcontainer;
		switch (idframe) {
			case '_full':
				secondcontainer = classes.generalSecondContainer;
				firstcontainer = classes.firstcontainerFull;
				break;
			case '_tl':
			case '_bl':
				secondcontainer = classes.secondContainerCVLeft;
				firstcontainer = classes.firstcontainerNoneFull;
				break;
			case '_tr':
			case '_br':
				secondcontainer = classes.secondContainerCVRight;
				firstcontainer = classes.firstcontainerNoneFull;
				break;
		}

		return (
			<div className={firstcontainer}>
			<div className={secondcontainer} id={"cvcontainer"+idframe} onContextMenu={this.contextMenu}>
				<div className={classes.synchstyle} id={"synch"+idframe}>
				</div>
				<canvas id={"canvas"+idframe} className={classes.canvas}>
				</canvas>
				<div id={"group_control"+idframe} style={{display: 'none', position: 'absolute',}}>
						{<label id={"label_popup"+idframe} className={classes.label}></label>}
						{<label id={"accuracy_popup"+idframe} className={classes.label}></label>}
				</div>
			</div>
			</div>
		)
	}
}

class Tracking extends React.Component {

	state = {
		isFull: false,
	};

	handleChangeFull = () => {
		this.setState({'isFull': !this.state.isFull});
	}

	render() {

		const { classes } = this.props;
		const { isFull } = this.state;

		return (
			<main className={classes.content}>
			<Fade in={isFull} timeout={1700} >
			<div className={classes.fullView} id="in_full_screen" style={{display: 'none'}}>
				<Subframe classes={classes} idframe={"_full"}/>
			</div>
			</Fade>
			
			<div className={classes.noneFullView} id="out_full_screen">
				<div className={classes.horizontal}>
					<div className={classes.vertical}><Subframe classes={classes} idframe={"_tl"}/></div>
					<div className={classes.vertical}><Subframe classes={classes} idframe={"_tr"}/></div>
				</div>
				<div className={classes.horizontal}>
					<div className={classes.vertical}><Subframe classes={classes} idframe={"_bl"}/></div>
					<div className={classes.vertical}><Subframe classes={classes} idframe={"_br"}/></div>
				</div>
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
			<div className={classes.hidden}>
				<span id="label_select"></span>
			</div>
			<span id="change_full_view" className={classes.hidden} onClick={this.handleChangeFull}/>
			</main>
			);
	}
}

Tracking.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Tracking);