import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = theme => ({
	paperSP: {
		minHeight: '100px',
	},
	rootTitle: {
		padding: '8px 24px 8px 24px',
	},
	text: {
		fontSize: '0.957rem',
		color: 'rgba(181, 18, 18, 0.87)',
	},
	secondcontainer:{
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 0,
	},
	canvas:{
		boxShadow: "0 5px 10px rgba(0, 0, 0, 0.35),0 5px 7px rgba(0, 0, 0, 0.24)",
	},
});

class AlertDialogAccept extends React.Component {
	state = {
		open: true,
	};

	handleClose = () => {
		this.setState({ open: false });
	};

	render() {
		const { classes, accept } = this.props;
		const self_view = this;
		return (
				<Dialog
					classes={{
						paperScrollPaper: classes.paperSP,
					}}
					open={this.state.open}
					onClose={this.handleClose}
					fullWidth={true}
					maxWidth='xl'
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle classes={{
						root: classes.rootTitle,
					}}
					id="alert-dialog-title"><div className={classes.text}>{"Review: "+name}</div></DialogTitle>
					<DialogContent classes={{
						root: classes.secondcontainer,
						}}>   
						Accepted
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleClose} color="primary">
							Close
						</Button>
					</DialogActions>
				</Dialog>
		);
	}
}

AlertDialogAccept.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AlertDialogAccept);