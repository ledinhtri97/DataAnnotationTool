	import React from 'react';
import ReactDOM from "react-dom";

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import TablePaginationActionsWrapped from '../overviewall-ui/table/pagination-actions'

import TableHead from '@material-ui/core/TableHead';
import Button from '@material-ui/core/Button';
import dateFormat from 'dateformat';

import AlertDialogView from "../overviewall-ui/table/dialog-view";
import {fabric} from 'fabric';
import {initCanvas} from '../../modules/labeling-module/renderInit';

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing.unit * 3,
	},
	table: {
		minWidth: 500,
	},
	tableWrapper: {
		overflowX: 'auto',
	},
	rightIcon: {
		marginLeft: theme.spacing.unit,
	},
	table_title: {
		fontSize: '0.947rem',
	},
	table_content: {
		fontSize: '0.915rem',
	},
	button: {
		margin: theme.spacing.unit,
		width: '7em',
		fontSize: '0.85em',
	},
	tablePagniation: {
		float: 'left',
	},
});

class UserTable extends React.Component {
	state = {
		page: 0,
		rowsPerPage: 5,
	};

	handleChangePage = (event, page) => {
		this.setState({ page });
	};

	handleChangeRowsPerPage = event => {
		this.setState({ page: 0, rowsPerPage: event.target.value });
	};
	
	render() {
		const self_table = this;
		const { classes, users } = this.props;
		const { rows, rowsPerPage, page } = this.state;
		const emptyRows = rowsPerPage - Math.min(rowsPerPage, users.length - page * rowsPerPage);

		return (
			<Paper className={classes.root}>
				<div className={classes.tableWrapper}>
					<Table className={classes.table}>

						<TableHead>
						<TableRow>
						<TableCell className={classes.table_title}>Username</TableCell>
						<TableCell align="center" className={classes.table_title}>Submitted</TableCell>            
						<TableCell align="center" className={classes.table_title}>Skipped</TableCell>
						<TableCell align="center" className={classes.table_title}>Flag Flase Predict</TableCell>
						<TableCell align="center" className={classes.table_title}>Label Created</TableCell>
						</TableRow>
						</TableHead>

						<TableBody>
							{users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(function(us, key) {
								return (
								<TableRow key={key}>
								<TableCell className={classes.table_content}>{us.username}</TableCell>
								<TableCell align="center" className={classes.table_content}>{us.submitted}</TableCell>
								<TableCell align="center" className={classes.table_content}>{us.skipped}</TableCell>
								<TableCell align="center" className={classes.table_content}>{us.flaged}</TableCell>
								<TableCell align="center" className={classes.table_content}>{us.label_count}</TableCell>
								</TableRow>
							)})}
							{emptyRows > 0 && (
								<TableRow style={{ height: 48 * emptyRows }}>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
						<TableFooter>
							<TableRow className={classes.tablePagniation}>
								<TablePagination
									rowsPerPageOptions={[5, 10, 25]}
									colSpan={3}
									count={users.length}
									rowsPerPage={rowsPerPage}
									page={page}
									SelectProps={{
										native: true,
									}}
									onChangePage={this.handleChangePage}
									onChangeRowsPerPage={this.handleChangeRowsPerPage}
									ActionsComponent={TablePaginationActionsWrapped}
								/>
							</TableRow>
						</TableFooter>
					</Table>
				</div>
			</Paper>
		);
	}
}

UserTable.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserTable);