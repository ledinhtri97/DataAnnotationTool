import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CheckCircle from '@material-ui/icons/CheckCircle';
import HighlightOff from '@material-ui/icons/HighlightOff';
import CloudDone from '@material-ui/icons/CloudDone';
import CloudOff from '@material-ui/icons/CloudOff';

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing.unit * 3,
		overflowX: 'auto',
	},
	table: {
		minWidth: 600,
	},
	button: {
		margin: theme.spacing.unit,
	},
	rightIcon: {
		marginLeft: theme.spacing.unit,
	},
	input: {
		display: 'none',
	},
	form: {
		display: 'flex',
	},
	table_title: {
		fontSize: '0.967rem',
	},
	table_content: {
		fontSize: '0.925rem',
	},
});

class UserTable extends React.Component {

	state = {
		something: null,
	};


	changeTitle = (id, event) => {

	}

	render() {

		const { classes } = this.props;

		const contributes = JSON.parse(document.getElementById("user_contribute").textContent)['user_contribute'];
		contributes.pop();
		const table = this;

		return (
			<Paper className={classes.root}>
			<Table className={classes.table}>
			<TableHead>
			<TableRow>
			<TableCell className={classes.table_title}>Contribute Name</TableCell>
			<TableCell className={classes.table_title}>Activate</TableCell>
			<TableCell className={classes.table_title}>File Name</TableCell>
			<TableCell className={classes.table_title}>Date Upload</TableCell>
			<TableCell className={classes.table_title}>Validate</TableCell>
			</TableRow>
			</TableHead>
			<TableBody>
			{
				contributes.map(function(ct, key){
					return (
						<TableRow key={key}>
						<TableCell component="th" scope="row" className={classes.table_content}>
						{ct.contribute_name}
						</TableCell>
						<TableCell className={classes.table_content}>
						{
							(ct.activate === 'True') ? (<CloudDone />) : (<CloudOff />)
						}
						</TableCell>
						<TableCell className={classes.table_content}>{ct.file_name}</TableCell>
						<TableCell className={classes.table_content}>{ct.date_upload}</TableCell>  
						<TableCell className={classes.table_content}>
						{
							(ct.validate === 'True') ? (<CheckCircle color='primary'/>) : (<HighlightOff color='secondary'/>)
						}
						</TableCell>  
						</TableRow>
						);
				})
			}

			</TableBody>
			</Table>
			</Paper>
			);
	}
}

UserTable.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserTable);