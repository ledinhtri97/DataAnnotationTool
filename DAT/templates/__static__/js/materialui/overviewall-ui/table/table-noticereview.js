import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import TableHead from '@material-ui/core/TableHead';
import Button from '@material-ui/core/Button';
import dateFormat from 'dateformat';

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

class TablePaginationActions extends React.Component {
  handleFirstPageButtonClick = event => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = event => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = event => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = event => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
    );
  };

  render() {
    const { classes, count, page, rowsPerPage, theme } = this.props;

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
}

TablePaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
  TablePaginationActions,
);

let counter = 0;
function createData(name, calories, fat) {
  counter += 1;
  return { id: counter, name, calories, fat };
}

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

class NoticeReviewTable extends React.Component {
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
    const { classes, notice_review } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, notice_review.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>

            <TableHead>
            <TableRow>
            <TableCell className={classes.table_title}>Meta Name</TableCell>
            <TableCell className={classes.table_title}>Message</TableCell>
            <TableCell className={classes.table_title}>Last Date Update</TableCell>
            <TableCell align="center" className={classes.table_title}>Flag Count</TableCell>
            <TableCell align="center" className={classes.table_title}>Labeled Count</TableCell>
            <TableCell align="center" className={classes.table_title}>Review</TableCell>
            </TableRow>
            </TableHead>

            <TableBody>
              {notice_review.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(function(ntv, key) {
                return (
                <TableRow key={key}>
                <TableCell component="th" scope="row" className={classes.table_content}>
                {ntv.meta_name}
                </TableCell>
                <TableCell component="th" scope="row" align="center" className={classes.table_content}>{ntv.message}</TableCell>
                <TableCell className={classes.table_content}>
                {dateFormat(new Date(ntv.last_date_update), "dddd, mmmm dS, yyyy, h:MM:ss TT").toString()}
                </TableCell>
                <TableCell align="center" className={classes.table_content}>{ntv.flag_count}</TableCell>
                <TableCell align="center" className={classes.table_content}>{ntv.label_count}</TableCell>
                <TableCell align="center" className={classes.table_content}>
                <Button variant="outlined" color="primary" className={classes.button}>
                Review
                </Button>
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
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={3}
                  count={notice_review.length}
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

NoticeReviewTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NoticeReviewTable);