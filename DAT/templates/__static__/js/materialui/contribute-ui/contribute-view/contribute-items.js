import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import AlertDialog from "../../dialog";
import ReactDOM from "react-dom";
//import videojs from 'video.js'
//require('!style-loader!css-loader!video.js/dist/video-js.css')
import ReactPlayer from 'react-player'

const styles = theme => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		overflow: 'hidden',
		marginTop: '5em',
		marginBottom: '1em',
		backgroundColor: theme.palette.background.paper,
	},
	gridList: {
		width: '90%',
		height: 'auto',
	},
	gridTitle: {

	},
	icon: {
		color: 'rgba(255, 255, 255, 0.54)',
	},
	button: {
		margin: theme.spacing(1),
	},
	label: {
		color: "#FFFFFF",
	},
	link: {
		textDecoration: 'none',
	},
	videoItem: {
		marginTop: '5em',
		display: 'flex',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

class ContributeItemsGrid extends React.Component{

	constructor(props) {
		// Required step: always call the parent class' constructor
		super(props);

		// Set the state directly. Use props if necessary.
		this.data_contribute = JSON.parse(document.getElementById("contribute_metas").textContent);

		this.contribute_metas = this.data_contribute['contribute_metas'];
		this.contribute_metas.pop()
		
		this.state = {};

		var state = this.state;

		this.contribute_metas.forEach(function(e, index){
			state['checked_'+index] = true;
		})
	};

	handleChange = (event, key) => {
		this.setState({ [key]: event.target.checked });
	};

	handleAccepted = () => {
		var dialog = document.getElementById("dialog");
		if(dialog){
			ReactDOM.unmountComponentAtNode(dialog);
			var message = "Agree accepted this contribute?";
			var request = "rqacceptcontrib";
			ReactDOM.render(<AlertDialog 
				message={message} 
				request={request} 
				accept_url={this.data_contribute['accept_url']}
				contribute_url={this.data_contribute['contribute_url']}
				/>, dialog);
		}
	};

	render() {
		const itemsGrid = this;
		const { classes } = itemsGrid.props;
		const type_contrib = document.getElementById("contribute_type").textContent;
		const accepted = document.getElementById("contribute_accepted").textContent;

		return (
		<div>
		<div className={classes.root}>
			<GridList cellHeight={280} className={classes.gridList}>
				<GridListTile key="Subheader" cols={2} style={{ height: 'auto', textAlign: 'right', }}>
					<ListSubheader component="div">
					Contribute Name: <a className={classes.link} href={itemsGrid.data_contribute['contribute_url']}> 
					{itemsGrid.data_contribute['contribute_name']}
					</a> | File Name: {itemsGrid.data_contribute['file_name']}
					{(accepted === 'False') ? (
						<Button variant="contained" onClick={itemsGrid.handleAccepted} color="primary" className={classes.button}>
							Accept
						</Button>
					) : (
						<Button variant="contained" onClick={function(e){}} color="primary" className={classes.button}>
							Save
						</Button>
					)}
					</ListSubheader>
				</GridListTile>
				{(type_contrib != 'mp4') && itemsGrid.contribute_metas.map(function(mt, key) {
					return (
					<GridListTile key={key}>
						<img src={mt.url_meta} alt="image" />
						<GridListTileBar
							actionIcon={
								<FormControlLabel
									control={
									<Switch
										checked={itemsGrid.state['checked_'+key]}
										onChange={function(e){itemsGrid.handleChange(e, 'checked_'+key)}}
										value={key+'_checkbox'}
									/>
									}    
									label="Selected"
									classes={{label: classes.label}}
								/>
							}
						/>
					</GridListTile>
				)})
			}
			</GridList>
			{(type_contrib == 'mp4') && 
				(
					<ReactPlayer 
						controls={true}
						url={itemsGrid.contribute_metas[0].url_meta}
						width={'896px'}
						height={'504px'}
						pip={true}
					/>
				)}
			</div>
		</div>);
	}
}
ContributeItemsGrid.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContributeItemsGrid);