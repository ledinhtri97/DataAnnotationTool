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
import AlertDialog from "../dialog";
import ReactDOM from "react-dom";

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

// var currentUpload = null;

class RequestTable extends React.Component {

  state = {
    currentUpload: null,
  };

  changeTitle = (id, event) => {

    var status = document.getElementById("contribute_status")
    status.textContent = "Files Upload: "+event.target.files[0].name;
    status.style['color'] = "#8C0C4B";

    this.setState({ currentUpload: id });
  };

  handleViewItem = (url_view) => {
    window.location.href = url_view;
  };

  handleAccepted = (url_accept) => {
    var dialog = document.getElementById("dialog");
    if(dialog){
      ReactDOM.unmountComponentAtNode(dialog);
      var message = "Agree accepted this contribute?";
      var request = "rqacceptcontrib";
      ReactDOM.render(<AlertDialog 
        message={message} 
        request={request} 
        accept_url={url_accept}
        contribute_url={window.location.href}
        />, dialog);
    }
  };

  render() {

    const { classes } = this.props;

    const contribute_request = JSON.parse(
      document.getElementById("contribute_request").textContent
      )['contribute_request'];

    contribute_request.pop();
    const table = this;

    return (
      <Paper className={classes.root}>
      <Table className={classes.table}>
      <TableHead>
      <TableRow>
      <TableCell className={classes.table_title}>User Name</TableCell>
      <TableCell align="right" className={classes.table_title}>File name</TableCell>
      <TableCell align="right" className={classes.table_title}>Date Upload</TableCell>
      <TableCell align="center" className={classes.table_title}>View</TableCell>
      <TableCell align="center" className={classes.table_title}>Accept</TableCell>
      </TableRow>
      </TableHead>
      <TableBody>
      {
        contribute_request.map(function(ct, key){
          return (
            <TableRow key={key}>
            <TableCell component="th" scope="row" className={classes.table_content}>
            {ct.user_name}
            </TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.file_name}</TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.date_upload}</TableCell>
            <TableCell align="center" className={classes.table_content}>
            <Button variant="contained" className={classes.button}
              onClick={function(e){table.handleViewItem(ct.url_view.replace("1", ct.id_file))}}
            >
            View
            </Button>
            </TableCell>
            <TableCell align="center" className={classes.table_content}>
            <Button 
            onClick={function(e){table.handleAccepted(ct.url_accept.replace("1", ct.id_file))}}
            variant="contained" className={classes.button}>
            Accept
            </Button>
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

RequestTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RequestTable);