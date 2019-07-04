import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button'; 
import UserTable from './table-user'
import TabShowLabels from '../overviewall-ui/tabshow-labels';

const styles = theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	root2: {
		paddingTop: '4rem',
		paddingBottom: '6rem',
		width: '95%',
	},
	exButton: {
		margin: theme.spacing(1),
		width: '20em',
		marginTop: '1rem',
	},
});

class AdminWorkspace extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			namews: 'Name Workspace',
			users: [],
			metadata: {
					submitted: [],
					skipped: [],
					flaged: [],
					notice_review: [],
			},
		}
	};

	getData(){
		setTimeout(() => {
			fetch(window.location.href+'api-get-data/', {})
			.then(response => {
				if(response.status !== 200){
					return "FAILED";
				}
				return response.json();
				}
			).then(__data__ => {
				if (__data__ === "FAILED") return;
				this.setState({
					namews: __data__.namews,
					users: __data__.users,
					metadata: __data__.metadata,
				});
			});
		}, 100);
	}

	componentDidMount(){
		this.getData();
	};

	render() {
		const { classes, theme } = this.props;
		const { namews, users, metadata } = this.state;

		return (
			<div className={classes.root}>
				<div className={classes.root2}>
					<Button variant="outlined" color="primary" className={classes.exButton}>
							{namews}
					</Button>
					<UserTable users={users}/>

					<TabShowLabels 
						submitted={metadata.submitted} 
						skipped={metadata.skipped} 
						flaged={metadata.flaged} 
						isAdmin={true}
						notice_review={metadata.notice_review}/>

				</div>
			</div>
		);
	}
}

AdminWorkspace.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(AdminWorkspace);