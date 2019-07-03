import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const CustomTableCell = withStyles(theme => ({
	head: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.common.white,
	},
	body: {
		fontSize: '0.85rem',
	},
}))(TableCell);

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing.unit * 7, //3.5em;
		overflowX: 'auto',
	},
	table: {
		minWidth: 300,
		
	},
	row: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.background.default,
		},
	},
	title: {
		fontSize: '0.95rem',
	}
});

function ProgressesTable(props) {
	const { classes, total, user } = props;

	return (
		<Paper className={classes.root}>
			<Table className={classes.table}>
				<TableHead>
					<TableRow>
						<CustomTableCell>IMAGE</CustomTableCell>
						<CustomTableCell align="right" className={classes.title}>Total Progress</CustomTableCell>
						<CustomTableCell align="right" className={classes.title}>Your Progress</CustomTableCell>
					</TableRow>
				</TableHead>
				<TableBody>

					<TableRow className={classes.row}>
						<CustomTableCell>Submitted</CustomTableCell>
						<CustomTableCell align="right">{total.submitted}</CustomTableCell>
						<CustomTableCell align="right">{user.submitted}</CustomTableCell>
					</TableRow>

					<TableRow className={classes.row}>
						<CustomTableCell>Available</CustomTableCell>
						<CustomTableCell align="right">{total.remaining}</CustomTableCell>
						<CustomTableCell align="right">{user.available}</CustomTableCell>
					</TableRow>

					<TableRow className={classes.row}>
						<CustomTableCell>Skipped</CustomTableCell>
						<CustomTableCell align="right">{total.skipped}</CustomTableCell>
						<CustomTableCell align="right">{user.skipped}</CustomTableCell>
					</TableRow>

					<TableRow className={classes.row}>
						<CustomTableCell>Label Created</CustomTableCell>
						<CustomTableCell align="right">{total.labels_created}</CustomTableCell>
						<CustomTableCell align="right">{user.labels_created}</CustomTableCell>
					</TableRow>

					<TableRow className={classes.row}>
						<CustomTableCell>Options</CustomTableCell>
						<CustomTableCell align="right">Complete: {total.complete+"%"}</CustomTableCell>
						<CustomTableCell align="right">
						Flag false predict: {user.flag_false_predict.mark} | {user.flag_false_predict.accepted}
						</CustomTableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Paper>
	);
}

ProgressesTable.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProgressesTable);