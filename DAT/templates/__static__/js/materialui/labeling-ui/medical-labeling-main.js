import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import GVCornerStone2 from './medical-gvcornerstone';
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
		backgroundColor: "#000000",
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
		//backgroundColor: "#000000",
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
		urls: [],
	};

	medical_label_state = null;
	active_idx_views = [0, 0, 0, 0];

	constructor(props) {
		super(props);
		this.state = {
			urls: this.props.urls,
		};
		this.medical_label_state = props.medical_label_state;
		this.active_idx_views = props.active_idx_views;
    }

	contextMenu = function(e) {
    	e.preventDefault();
    	return false;
	};

	render() {

		const { classes, phase_names } = this.props;
		const {urls} = this.state;

		/*
		// container.js
		const medical_mapping_chart_list = document.getElementById("medical_mapping_chart_list");
		ReactDOM.render(<MedicalMappingChartList />, medical_mapping_chart_list);
		*/
		
		const total_items = urls.length;
		const medical_label_state = this.medical_label_state;
		const active_idx_views = this.active_idx_views;

		return (
			<main className={classes.content}>
				<div className={classes.firstcontainer}>
					<div className={classes.secondcontainer} id="cvcontainer" onContextMenu={this.contextMenu}>
						<Grid container id="medicalGridContainer" className={classes.root} className={classes.gridcontainer}>
							{urls.map( function(url_list, i) {
								return (
									<GVCornerStone2 
										key={i} 
										idx={i} 
										total_items={total_items} 
										urls={url_list} 
										phase_name={phase_names[i]}
										active_idx={active_idx_views[i]}
										medical_label_state={medical_label_state} />
								)
							} )
							}	
						</Grid>

						<div id="group_control" style={{display: 'none', position: 'absolute',}}>
							{<label id="label_popup" className={classes.label}></label>}
							{<label id="accuracy_popup" className={classes.label}></label>}
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
				</div>
			</main>

			);
	}
}

MedicalLabeling.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedicalLabeling);