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
import AttachFile from '@material-ui/icons/AttachFile';
import Cookie from 'js-cookie';

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
  table_title: {
    fontSize: '0.967rem',
  },
  table_content: {
    fontSize: '0.925rem',
  },
});

class SkippedTable extends React.Component {

  state = {
    something: null,
  };

  render() {

    const { classes } = this.props;

    const contributes = [];
    contributes.pop();
    
    const table = this;

    return (
      <Paper className={classes.root}>
      <Table className={classes.table}>
      <TableHead>
      <TableRow>
      <TableCell className={classes.table_title}>Meta Name</TableCell>
      <TableCell align="right" className={classes.table_title}>Date Skipped</TableCell>
      <TableCell align="right" className={classes.table_title}>Labeled Count</TableCell>
      <TableCell align="right" className={classes.table_title}>View</TableCell>
      <TableCell align="center" className={classes.table_title}>Notice Review</TableCell>
      </TableRow>
      </TableHead>
      <TableBody>
      {
        contributes.map(function(ct, key){
          return (
            <TableRow key={key}>
            <TableCell component="th" scope="row" className={classes.table_content}>{ct.name}</TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.description}</TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.users_count}</TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.contribute_count}</TableCell>
            <TableCell align="center" className={classes.table_content}></TableCell>
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

SkippedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SkippedTable);