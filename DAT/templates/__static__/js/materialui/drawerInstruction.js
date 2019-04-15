import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import Keyboard from '@material-ui/icons/Keyboard';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
const styles = theme =>({
	list: {
		width: 250,
	},
	fullList: {
		width: 'auto',
	},
	lightTooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
});

class TemporaryDrawerInstruction extends React.Component {
	state = {
		right: false,
	};

	toggleDrawer = (side, open) => () => {
		this.setState({
			[side]: open,
		});
	};

	render() {
		const { classes } = this.props;

		const sideList = (
			<div className={classes.list}>
			<List>
			{['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
				<ListItem button key={text}>
				<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
				<ListItemText primary={text} />
				</ListItem>
				))}
			</List>
			<Divider />
			<List>
			{['All mail', 'Trash', 'Spam'].map((text, index) => (
				<ListItem button key={text}>
				<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
				<ListItemText primary={text} />
				</ListItem>
				))}
			</List>
			</div>
			);

		const fullList = (
			<div className={classes.fullList}>
			<List>
			{['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
				<ListItem button key={text}>
				<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
				<ListItemText primary={text} />
				</ListItem>
				))}
			</List>
			<Divider />
			<List>
			{['All mail', 'Trash', 'Spam'].map((text, index) => (
				<ListItem button key={text}>
				<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
				<ListItemText primary={text} />
				</ListItem>
				))}
			</List>
			</div>
			);

		return (
			<div>
			<Tooltip 
						title="Hotkeys" 
						TransitionComponent={Zoom} 
						placement="bottom" 
						classes={{tooltip: classes.lightTooltip}}>
			<IconButton onClick={this.toggleDrawer('right', true)} color='inherit' aria-haspopup="true"><Keyboard/></IconButton>
			</Tooltip>
			<Drawer anchor="right" open={this.state.right} onClose={this.toggleDrawer('right', false)}>
			<div
			tabIndex={0}
			role="button"
			onKeyDown={this.toggleDrawer('right', false)}
			>
			{sideList}
			</div>
			</Drawer>
			</div>
			);
	}
}
// onClick={this.toggleDrawer('right', false)} //click on item to close


TemporaryDrawerInstruction.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TemporaryDrawerInstruction);