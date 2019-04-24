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
  }
});

const CSRFToken = () => {
  return (
    <input type="hidden" name="csrfmiddlewaretoken" value={Cookie.get("csrftoken")} />
    );
};

class UserTable extends React.Component {

  state = {
    something: null,
  };


  changeTitle = (id, event) => {

  }

  render() {

    const { classes } = this.props;

    const contributes = JSON.parse(document.getElementById("user_contribute").textContent)['user'];
    contributes.pop();
    const table = this;

    return (
      <Paper className={classes.root}>
      <Table className={classes.table}>
      <TableHead>
      <TableRow>
      <TableCell>Acceptable</TableCell>
      <TableCell align="right">Name</TableCell>
      <TableCell align="right">Description</TableCell>
      <TableCell align="right">Contribute Files</TableCell>
      </TableRow>
      </TableHead>
      <TableBody>
      {
        contributes.map(function(ct, key){
          return (
            <TableRow key={key}>
            <TableCell component="th" scope="row">
            {ct.name}
            </TableCell>
            <TableCell align="right">{ct.description}</TableCell>
            <TableCell align="right">{ct.users_count}</TableCell>
            <TableCell align="right">{ct.contribute_count}</TableCell>
            <TableCell align="center">
            <form className={classes.form}
            encType="multipart/form-data" action={ct.url_upload} method="post">
            <CSRFToken />

            <input
            accept=".rar, .zip, .jpg, .png, .PNG, .JPG, .JPEG, .mp4, .avi"
            multiple
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

UserTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserTable);