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

const CSRFToken = () => {
  return (
    <input type="hidden" name="csrfmiddlewaretoken" value={Cookie.get("csrftoken")} />
    );
};

// var currentUpload = null;

class ContributeTable extends React.Component {

  state = {
    currentUpload: null,
  };


  handleDisabled = (button, disabled) => {
    if(disabled){
      button.style["color"] = 'rgba(0, 0, 0, 0.26)';
      button.style["box-shadow"] = 'none';
      button.style["cursor"] = 'default';
      button.style["pointer-events"] = 'none';
    }
    else{
      button.style["color"] = 'rgba(0, 0, 0, 0.87)';
      button.style["box-shadow"] = '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)';
      button.style["cursor"] = 'pointer';
      button.style["pointer-events"] = 'auto';
    }
  };

  changeTitle = (id, event) => {

    var status = document.getElementById("contribute_status")
    status.textContent = "Files Upload: "+event.target.files[0].name;
    status.style['color'] = "#8C0C4B";

    this.setState({ currentUpload: id });
  }

  render() {

    const { classes } = this.props;

    const contributes = JSON.parse(document.getElementById("contribute_data").textContent)['contribute_data'];
    contributes.pop();
    const table = this;

    return (
      <Paper className={classes.root}>
      <Table className={classes.table}>
      <TableHead>
      <TableRow>
      <TableCell className={classes.table_title}>Name</TableCell>
      <TableCell align="right" className={classes.table_title}>Description</TableCell>
      <TableCell align="right" className={classes.table_title}>Contribute Users</TableCell>
      <TableCell align="right" className={classes.table_title}>Contribute Files</TableCell>
      <TableCell align="center" className={classes.table_title}>Contribute</TableCell>
      </TableRow>
      </TableHead>
      <TableBody>
      {
        contributes.map(function(ct, key){
          return (
            <TableRow key={key}>
            <TableCell component="th" scope="row" className={classes.table_content}>
            {ct.name}
            </TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.description}</TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.users_count}</TableCell>
            <TableCell align="right" className={classes.table_content}>{ct.contribute_count}</TableCell>
            <TableCell align="center" className={classes.table_content}>
            <form className={classes.form}
            encType="multipart/form-data" action={ct.url_upload.replace("1", ct.id)} method="post">
            <CSRFToken />

            <input
            accept=".rar, .zip, .jpg, .png, .PNG, .JPG, .JPEG, .mp4, .avi"
            //multiple
            type="file"
            id={"ctb_"+ct.id}
            className={classes.input}
            name="contribute_uploaded_file"
            onChange={function(e){table.changeTitle(ct.id, e)}}
            />
            <label htmlFor={"ctb_"+ct.id}>
            <Button 
            id={"file_"+ct.id}
            variant="contained" 
            component="span" className={classes.button}>
            Files
            <AttachFile className={classes.rightIcon}/>
            </Button>
            </label>

            <Button
            id={"up_"+ct.id}
            component="button"
            type="submit"
            variant="contained" color="default" className={classes.button} 
            disabled={table.state.currentUpload!=ct.id}
            >
            <CloudUploadIcon />
            </Button>
            </form>
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

ContributeTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContributeTable);