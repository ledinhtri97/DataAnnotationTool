import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	footer: {
		backgroundColor: "#c1c1c1",
		padding: theme.spacing.unit * 6,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: '5rem',
	},
});

class Footer extends React.Component {

	render() {
		const { classes } = this.props;

		return (
			<div className={classes.footer}>
			Data Annotation Tool - GVLab | Copyright@2019
			</div>
		);
	}
}

Footer.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Footer);