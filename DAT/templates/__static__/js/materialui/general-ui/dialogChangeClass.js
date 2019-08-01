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
				let values = event.target.info || event.target.value;
				values = values.split(',');
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

		let label_select = labelControl.getListLabel();

		return (
			<Dialog
				open={this.state.open}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">{"Data Annotation Tool - GVLab"}</DialogTitle>
				<DialogContent>
				<FormControl component="fieldset" className={classes.formControl}>
					<IntegrationReactSelect suggestions={label_select} handleClose={selfForm.handleClose}/>
					<RadioGroup
						name="changeclass" className={classes.group}
						value={labelControl.getValueClass()}
						onChange={function(e){selfForm.handleClose(e)}}
					>
					{
					label_select.map(function(i, key) {
						return (<FormControlLabel key={key} value={i.info} label={i.label}
								control={<Radio color="primary"/>}/>
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