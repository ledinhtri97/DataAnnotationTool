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
		margin: theme.spacing(1),
		backgroundColor: "#4285f4",
	},
	leftIcon: {
		padding: "0 3px",
		marginRight: theme.spacing(2),
	},
	heroUnit: {
		backgroundColor: theme.palette.background.paper,
	},
	heroContent: {
		maxWidth: 600,
		margin: '0 auto',
		padding: `${theme.spacing(4)}px 0 ${theme.spacing(3)}px`,
	},
	heroButtons: {
		marginTop: theme.spacing(3),
	},
	layout: {
		width: 'auto',
		marginLeft: theme.spacing(3),
		marginRight: theme.spacing(3),
		[theme.breakpoints.up(1100 + theme.spacing(2) * 3)]: {
			width: 1100,
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	},
	cardGrid: {
		padding: `${theme.spacing(2)}px 0`,
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

	constructor(props){
		super(props);
		this.state = {
			workspaces: [],
		}
	};

	getData(){
		setTimeout(
			fetch("/gvlab-dat/workspace/api-get-data/", {})
			.then(res => {
				if (res.status != 200){
					return "FAILED";
				}
				return res.json();
			})
			.then(data => {
				if(data === "FAILED") return;
				this.setState({
					workspaces: data,
				})
			}), 100);
	}

	componentDidMount(){
        this.getData();
    };

	handleContribute = () => {
		window.location.href = document.getElementById("url_contribute").textContent;
	};

	handleOverviewAll = () => {
		window.location.href = document.getElementById("url_overviewall").textContent;;
	};

	handleOverview =  (id) => {
		window.location.href = "/gvlab-dat/workspace/overview/"+id;
	};

	handleStartLabeling = (id) => {
		window.location.href = "/gvlab-dat/workspace/ws-"+id;
	};

	render() {

		const { classes } = this.props;
		const { workspaces } = this.state;
		const thiswp = this;

		return (
			<React.Fragment>
			<main className={classes.main}>
			<div className={classes.heroUnit}>
			<div className={classes.heroContent}>
			<Typography component="h3" variant="h2" align="center" color="textPrimary" gutterBottom>
			Main Workspace
			</Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={10} justify="center">
                <Grid item>
                  <Button 
                  	onClick={thiswp.handleOverviewAll}
                  	variant="contained" color="primary">
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
          <Grid container spacing={4}>
          {workspaces.map(
          	function(wp, key) {
          		return (
          			<Grid item key={key} sm={6} md={4} lg={3}>
          			<Card className={classes.card}>
          			<CardMedia
          			className={classes.cardMedia} image={wp.img_rep} title={wp.name}/>
          			<CardContent className={classes.cardContent}>
          			<Typography gutterBottom variant="h5" component="h2">
          			{wp.nameworkspace}
          			</Typography>
          			<Typography>
          			Dataset ID: {wp.dataset}<br/>
          			Total data: {wp.num_allmeta}<br/>
          			Annotated data: {wp.num_annotated_meta}
          			</Typography>
          			</CardContent>
          			<CardActions>
          			<Button 
          				onClick={function(e){thiswp.handleOverview(wp.dataset)}} 
          				color="primary" size="small">
          			<BarChart className={classes.rightIcon} />
          			OVERVIEW
          			</Button>
          			<Button 
          				onClick={function(e){thiswp.handleStartLabeling(wp.dataset)}} 
          				variant="contained" size="small" color="primary" 
          				className={classes.button}>
          			<OpenInNew className={classes.rightIcon} />
          			LABELING
          			</Button>
          			</CardActions>
          			</Card>
          			</Grid>
          			)})}
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