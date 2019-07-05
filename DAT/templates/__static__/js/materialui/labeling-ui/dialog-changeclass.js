import React from 'react';
import PropTypes from 'prop-types';
import { fade, withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import SearchIcon from '@material-ui/icons/Search';

import IntegrationReactSelect from './autoComplete';

const styles = theme =>({
	formControl: {
		margin: theme.spacing(3),
	},
	group: {
		margin: theme.spacing(1),
	},
});

class AlertDialogChangeClass extends React.Component {
	state = {
		open: true,
	};

	handleClose = (event) => {
			if(event.target.value){
				let values = event.target.value.split(',');
				let res = this.props.labelControl.__changeClass__(values[0], values[1], values[2]);
				if (res){
					this.setState({ open: false });
					this.props.callSetName(values[0]); //dig
				}
				else{
					alert("Cannot change different type of shape");
				}
			}
			else{
				if (this.props.labelControl.getNameLabel()){
					this.props.labelControl.__noClassChange__();
					this.setState({ open: false });
				}
				else {
					alert("You must choose label for this object !");
				}
			}
	};

	render() {

		const selfForm = this;
		const { classes, labelControl} = this.props;
		let lbs = document.getElementById('label_select');
		let label_select = [];
		
		JSON.parse(lbs.textContent).label_select.map(function(lb) {
			if (lb.type_label === labelControl.getTypeLabel()){
				label_select.push({
					value: lb.tag_label+','+lb.type_label+','+lb.color,
					label: lb.tag_label,
				});
			}
		});

		return (
				<Dialog
					open={this.state.open}
					onClose={this.handleClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">{"Data Annotation Tool - GVlab"}</DialogTitle>
					<DialogContent>
					<FormControl component="fieldset" className={classes.formControl}>
						<IntegrationReactSelect suggestions={label_select} handleClose={selfForm.handleClose}/>
						<RadioGroup
							name="changeclass"
							className={classes.group}
							value={labelControl.getValueClass()}
							onChange={function(e){selfForm.handleClose(e)}}
						>
						{
						label_select.map(function(i, key) {
							return (
								<FormControlLabel key={key} 
									value={i.value} control={<Radio color="primary"/>} 
									label={i.label} />
							);
						})}
						</RadioGroup>
					</FormControl>
					</DialogContent>
				</Dialog>
		);
	}
}

AlertDialogChangeClass.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AlertDialogChangeClass);