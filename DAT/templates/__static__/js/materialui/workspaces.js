import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import BarChart from '@material-ui/icons/BarChart';
import OpenInNew from '@material-ui/icons/OpenInNew';

const styles = theme => ({
	main:{
		paddingTop: "10px",
	},
	button:{
		margin: theme.spacing.unit,
		backgroundColor: "#4285f4",
	},
	leftIcon: {
		padding: "0 3px",
		marginRight: theme.spacing.unit * 2,
	},
	heroUnit: {
		backgroundColor: theme.palette.background.paper,
	},
	heroContent: {
		maxWidth: 600,
		margin: '0 auto',
		padding: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 3}px`,
	},
	heroButtons: {
		marginTop: theme.spacing.unit * 3,
	},
	layout: {
		width: 'auto',
		marginLeft: theme.spacing.unit * 3,
		marginRight: theme.spacing.unit * 3,
		[theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
			width: 1100,
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	},
	cardGrid: {
		padding: `${theme.spacing.unit * 5}px 0`,
	},
	card: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	cardMedia: { // 16:9
		paddingTop: '56.25%',
	},
	cardContent: {
		flexGrow: 1,
	},
});

class Workspaces extends React.Component {

	state = {
		something: null,
	};

	handleContribute = () => {
		window.location.href = '/gvlab-dat/workspace/contribute/';
	};

	handleOverview = () => {
		window.location.href = "/gvlab-dat/workspace/#";
	};

	handleStartLabeling = (startlabeling_url) => {
		window.location.href = startlabeling_url;
	};

	render() {

		const { classes } = this.props;
		const thiswp = this;
		const workspaces = JSON.parse(document.getElementById("home").textContent)['workspaces'];
		workspaces.pop();

		return (
			<React.Fragment>
			<main className={classes.main}>
			<div className={classes.heroUnit}>
			<div className={classes.heroContent}>
			<Typography component="h3" variant="h2" align="center" color="textPrimary" gutterBottom>
			Main Workspace
			</Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={16} justify="center">
                <Grid item>
                  <Button variant="contained" color="primary">
                    Overview Working
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" color="primary" 
                  onClick={function(e){thiswp.handleContribute()}}>
                    Contribute Data
                  </Button>
                </Grid>
              </Grid>
          </div>
          </div>
          </div>
          <div className={classNames(classes.layout, classes.cardGrid)}>
          <Grid container spacing={40}>
          {workspaces.map(
          	function(wp, key) {if(wp.name) {

          		return (
          			<Grid item key={key} sm={6} md={4} lg={3}>
          			<Card className={classes.card}>
          			<CardMedia
          			className={classes.cardMedia} image="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E" title={wp.name}/>
          			<CardContent className={classes.cardContent}>
          			<Typography gutterBottom variant="h5" component="h2">
          			{wp.name}
          			</Typography>
          			<Typography>
          			Dataset ID: {wp.iddataset}<br/>
          			Total data: {wp.total}<br/>
          			Annotated data: {wp.anno}
          			</Typography>
          			</CardContent>
          			<CardActions>
          			<Button 
          				onClick={function(e){thiswp.handleOverview()}} 
          				color="primary" size="small">
          			<BarChart className={classes.rightIcon} />
          			OVERVIEW
          			</Button>
          			<Button 
          				onClick={function(e){thiswp.handleStartLabeling(wp.url_join)}} 
          				variant="contained" size="small" color="primary" 
          				className={classes.button}>
          			<OpenInNew className={classes.rightIcon} />
          			LABELING
          			</Button>
          			</CardActions>
          			</Card>
          			</Grid>
          			)}})}
          </Grid>
          </div>
          </main>
          </React.Fragment>
          );
	}
}

Workspaces.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Workspaces);