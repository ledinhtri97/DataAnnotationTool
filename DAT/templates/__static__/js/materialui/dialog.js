import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {controllerRequest} from "../labeling";
import {rqsavesettings, rqacceptcontrib} from "../modules/request";

class AlertDialog extends React.Component {
	state = {
		open: true,
	};

	handleClose = () => {
		this.setState({ open: false });
	};

	handleRequest = () => {
		this.setState({ open: false });
		var request = this.props.request;
		if (request == 'warning_label') return;
		if (request == 'rqacceptcontrib') {
			rqacceptcontrib(this.props.accept_url, this.props.contribute_url);
		}
		else if (request == 'rqsavesettings'){
			rqsavesettings();
		}
		else {
			controllerRequest(request);
		}
	}; 

	render() {

		var message = this.props.message;

		return (
				<Dialog
					open={this.state.open}
					onClose={this.handleClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">{"Data Annotation Tool - GVlab"}</DialogTitle>
					<DialogContent>
						<DialogContentText id="alert-dialog-description">
							{message}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleClose} color="primary">
							Disagree
						</Button>
						<Button onClick={this.handleRequest} color="primary" autoFocus>
							Agree
						</Button>
					</DialogActions>
				</Dialog>
		);
	}
}

export default AlertDialog;