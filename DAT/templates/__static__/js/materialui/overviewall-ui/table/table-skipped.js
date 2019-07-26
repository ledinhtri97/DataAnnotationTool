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

import TablePaginationActionsWrapped from './pagination-actions'

import TableHead from '@material-ui/core/TableHead';
import Button from '@material-ui/core/Button';
import dateFormat from 'dateformat';

import AlertDialogView from "./dialog-view";
import {fabric} from 'fabric';
import {initCanvas} from '../../../modules/labeling-module/renderInit';

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing(3),
	},
	table: {
		minWidth: 500,
	},
	tableWrapper: {
		overflowX: 'auto',
	},
	rightIcon: {
		marginLeft: theme.spacing(1),
	},
	table_title: {
		fontSize: '0.947rem',
	},
	table_content: {
		fontSize: '0.915rem',
	},
	button: {
		margin: theme.spacing(1),
		width: '7em',
		fontSize: '0.85em',
	},
	tablePagniation: {
		float: 'left',
	},
});

class ButtonStatus extends React.Component {
	constructor(props){
		super(props);
		
		this.state = {
			isView: props.skd.view,
		};
	};

	handleChangeBlock = () => {
		this.setState({ isView: true});
		let {self_table, skd} = this.props;
		skd.view = true;
		self_table.handleUnBlock(skd.meta_id);
	};

	render(){
		const {isAdmin, classes, skd, self_table} = this.props;
		const self_button = this;
		return (
			<React.Fragment>{
				skd.view ? <Button 
				onClick={function(e){self_table.handleView(skd.url_meta)}}
				variant="outlined" color="primary" className={classes.button}>
				View
				</Button> :
					<React.Fragment> 
					{isAdmin ? <Button
						onClick={function(e){self_button.handleChangeBlock()}}
						variant="outlined" color="primary" className={classes.button}>
						UnBlocked
					</Button> :
					<Button variant="outlined" color="primary" className={classes.button}>
						Blocked
				</Button>
				}
				</React.Fragment>
			}
			</React.Fragment>
		);
	}
}

class SkippedTable extends React.Component {
	state = {
		page: 0,
		rowsPerPage: 10,
	};

	handleChangePage = (event, page) => {
		this.setState({ page });
	};

	handleChangeRowsPerPage = event => {
		this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
	};

	handleView = (url_meta) => {
		var dialog_view = document.getElementById("dialog_view");
		fetch(url_meta, {})
			.then(response => {
					if(response.status !== 200){
						return "FAILED";
					}
					return response.json();
				}
			).then(meta => {
					if(meta === "FAILED") return;
					
					if(dialog_view){
						ReactDOM.unmountComponentAtNode(dialog_view);
						ReactDOM.render(
							<AlertDialogView name={meta.name} metaid={meta.id}/>, dialog_view
						);

						const canvas = new fabric.Canvas('canvas', {
							hoverCursor: 'pointer',
							selection: true,
							backgroundColor: null,
							uniScaleTransform: true,
						});

						initCanvas(canvas, meta, true);
				}
			});
	};

	handleUnBlock = (meta_id) => {
		let url_unblock_meta = '/gvlab-dat/datadmin/workspace/unblock_metaid-'+meta_id;

		fetch(url_unblock_meta, {})
			.then(response => {
					if(response.status !== 200){
						return "FAILED";
					}
					return response.json();
				}
			).then(re => {
				if(re === "FAILED") return;
				console.log(re);
			});
	};

	render() {
		const self_table = this;
		const { classes, skipped, isAdmin } = this.props;
		const { rowsPerPage, page,  } = this.state;
		const emptyRows = rowsPerPage - Math.min(rowsPerPage, skipped.length - page * rowsPerPage);

		return (
			<Paper className={classes.root}>
				<div className={classes.tableWrapper}>
					<Table className={classes.table}>

						<TableHead>
							<TableRow className={classes.tablePagniation}>
								<TablePagination
									rowsPerPageOptions={[5, 10, 20, 30, 40, 50]} //5, 10, 25
									colSpan={3}
									count={skipped.length}
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
						</TableHead>

						<TableHead>
						<TableRow>
						<TableCell className={classes.table_title}>Thumbnail</TableCell>
						<TableCell className={classes.table_title}>Meta Id</TableCell>
						<TableCell className={classes.table_title}>Last Date Update</TableCell>
						<TableCell className={classes.table_title}>Reason Skipped</TableCell>
						<TableCell align="center" className={classes.table_title}>Labeled Count</TableCell>
						<TableCell align="center" className={classes.table_title}>View</TableCell>
						</TableRow>
						</TableHead>

						<TableBody>
							{skipped.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(function(skd, key) {
								return (
								<TableRow key={key}>
								<TableCell className={classes.table_content}>
									<img style={{ height: '200px'}} src={skd.url_thumb} 
										onClick={function(e){ if(skd.view){self_table.handleView(skd.url_meta)}}}/>
								</TableCell>
								<TableCell component="th" scope="row" className={classes.table_content}>
								{skd.meta_id}
								</TableCell>
								<TableCell className={classes.table_content}>
								{dateFormat(new Date(skd.last_date_update), "dddd, mmmm dS, yyyy, h:MM:ss TT").toString()}
								</TableCell>
								<TableCell className={classes.table_content}>{skd.reason_skipped}</TableCell>
								<TableCell align="center" className={classes.table_content}>{skd.label_count}</TableCell>
								<TableCell align="center" className={classes.table_content}>
								<ButtonStatus 
								isAdmin={isAdmin} self_table={self_table} 
								classes={classes} skd={skd} />
								</TableCell>
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
									rowsPerPageOptions={[5, 10, 20, 30, 40, 50]} //5, 10, 25
									colSpan={3}
									count={skipped.length}
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

SkippedTable.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SkippedTable);