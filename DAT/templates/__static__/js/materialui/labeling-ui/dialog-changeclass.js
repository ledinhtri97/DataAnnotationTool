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

const styles = theme =>({
	formControl: {
		margin: theme.spacing.unit * 3,
	},
	group: {
		margin: theme.spacing.unit,
	},
});

// const useStyles = makeStyles(theme => ({
// 	search: {
// 	    position: 'relative',
// 	    borderRadius: theme.shape.borderRadius,
// 	    backgroundColor: fade(theme.palette.common.white, 0.15),
// 	    '&:hover': {
// 	      backgroundColor: fade(theme.palette.common.white, 0.25),
// 	    },
// 	    marginLeft: 0,
// 	    width: '100%',
// 	    [theme.breakpoints.up('sm')]: {
// 	      marginLeft: theme.spacing(1),
// 	      width: 'auto',
// 	    },
// 	},
// 	searchIcon: {
// 	    width: theme.spacing(7),
// 	    height: '100%',
// 	    position: 'absolute',
// 	    pointerEvents: 'none',
// 	    display: 'flex',
// 	    alignItems: 'center',
// 	    justifyContent: 'center',
// 	},
// 	inputRoot: {
// 	    color: 'inherit',
// 	},
// 	inputInput: {
// 	    padding: theme.spacing(1, 1, 1, 7),
// 	    transition: theme.transitions.create('width'),
// 	    width: '100%',
// 	    [theme.breakpoints.up('sm')]: {
// 	      width: 120,
// 	      '&:focus': {
// 	        width: 200,
// 	      },
// 	    },
// 	 },
// }));


class AlertDialogChangeClass extends React.Component {
		state = {
				open: true,
		};

		contextMenu = function(e) {
				e.preventDefault();
				return false;
		};

		handleClose = (event) => {
				// alert(event.target.value);
				if(event.target.value){
						let values = event.target.value.split(',');
						//lb.tag_label+','+lb.type_label+','+lb.color;
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
						this.setState({ open: false });
				}
		};

	render() {

		const selfForm = this;
		const { classes, labelControl} = this.props;
		// const cl = useStyles();
		let lbs = document.getElementById('label_select');
		let label_select = JSON.parse(lbs.textContent).label_select;

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
							<FormLabel component="legend">Change class label</FormLabel>
							
							<RadioGroup
								aria-label="Change class label"
								name="changeclass"
								className={classes.group}
								value={labelControl.getValueClass()}
								onChange={function(e){selfForm.handleClose(e)}}
							>
							{ 
							label_select.map(function(lb) {
								let labelname = lb.tag_label.charAt(0).toUpperCase() + lb.tag_label.slice(1);
								let labeltype = lb.type_label.charAt(0).toUpperCase() + lb.type_label.slice(1);
								let id = lb.tag_label+','+lb.type_label+','+lb.color;
								if (lb.type_label === labelControl.getTypeLabel()){
									return (
										<FormControlLabel key={lb.id} value={id} control={<Radio color="primary"/>} label={labelname + ' | ' +labeltype} />
									);}  
								}
							)
						}
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