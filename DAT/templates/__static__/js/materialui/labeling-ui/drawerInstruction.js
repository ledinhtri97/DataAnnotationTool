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
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';

import Filter1 from '@material-ui/icons/Filter1';
import Filter2 from '@material-ui/icons/Filter2';
import Filter3 from '@material-ui/icons/Filter3';
import Filter4 from '@material-ui/icons/Filter4';
import Filter5 from '@material-ui/icons/Filter5';
import Filter6 from '@material-ui/icons/Filter6';
import Filter7 from '@material-ui/icons/Filter7';
import Filter8 from '@material-ui/icons/Filter8';
import Filter9 from '@material-ui/icons/Filter9';

const styles = theme =>({
	list: {
		width: 300,
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
	listItem:{
		paddingTop: "3px",
		paddingBottom: "3px", 
	},
	caption:{
		padding: "5px",
		fontWeight: 300,
		fontSize: "1em",
	},
	grow: {
		flexGrow: 1,
		padding: "8px 25px",
		fontWeight: 500,
		backgroundColor: "#f0f0f0",
	}
});

const MAP_ICON_INS = {
	A: (<IconButton><SvgIcon><path d="M3,5C3,3.9 3.9,3 5,3H19C20.1,3 21,3.9 21,5V19C21,20.1 20.1,21 19,21H5C3.89,21 3,20.1 3,19V5M11,7C9.9,7 9,7.9 9,9V17H11V13H13V17H15V9C15,7.9 14.1,7 13,7H11M11,9H13V11H11V9Z" /></SvgIcon></IconButton> ),
	B: (<IconButton><SvgIcon><path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M15,10.5V9A2,2 0 0,0 13,7H9V17H13A2,2 0 0,0 15,15V13.5C15,12.7 14.3,12 13.5,12C14.3,12 15,11.3 15,10.5M13,15H11V13H13V15M13,11H11V9H13V11Z" /></SvgIcon></IconButton> ),
	S: (<IconButton><SvgIcon><path d="M11,7A2,2 0 0,0 9,9V11A2,2 0 0,0 11,13H13V15H9V17H13A2,2 0 0,0 15,15V13A2,2 0 0,0 13,11H11V9H15V7H11M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	E: (<IconButton><SvgIcon><path d="M9,7V17H15V15H11V13H15V11H11V9H15V7H9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	H: (<IconButton><SvgIcon><path d="M9,7V17H11V13H13V17H15V7H13V11H11V7H9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	D: (<IconButton><SvgIcon><path d="M9,7V17H13A2,2 0 0,0 15,15V9A2,2 0 0,0 13,7H9M11,9H13V15H11V9M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z" /></SvgIcon></IconButton> ),
	Q: (<IconButton><SvgIcon><path d="M11,7A2,2 0 0,0 9,9V15A2,2 0 0,0 11,17V19H13V17A2,2 0 0,0 15,15V9A2,2 0 0,0 13,7H11M11,9H13V15H11V9M5,4H19A2,2 0 0,1 21,6V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V6A2,2 0 0,1 5,4Z" /></SvgIcon></IconButton> ),
	SHIFT: (<IconButton><SvgIcon><path d="M19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21M12,7L7,12H10V16H14V12H17L12,7Z" /></SvgIcon></IconButton> ),
};

const MAP_TEXT_INS = {
	A: "Skip and next",
	B: "Report bad data and next",
	S: "Save and next",
	E: "Hover on shape and edit",
	H: "Hover on shape and hidden",
	D: "Hover on shape and delete",
	Q: "Quit drawing",
	SHIFT: "Press Shift key in drawing mode or on shape to display all same shape available",
};

const MAP_LABEL_INS = [
<IconButton><Filter1/></IconButton>,
<IconButton><Filter2/></IconButton>,
<IconButton><Filter3/></IconButton>,
<IconButton><Filter4/></IconButton>,
<IconButton><Filter5/></IconButton>,
<IconButton><Filter6/></IconButton>,
<IconButton><Filter7/></IconButton>,
<IconButton><Filter8/></IconButton>,
<IconButton><Filter9/></IconButton>
];

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
		
		var labelselect = JSON.parse(document.getElementById("label_select").textContent)['labels'];
		labelselect.pop();
		
		const sideList = (
			<div className={classes.list}>
			<Typography variant="title" color="inherit" className={classes.grow}>Hotkeys character</Typography>
			<List>
			{['A', 'B', 'S', 'E', 'H', 'D', 'Q'].map((text, index) => (
				<ListItem button key={index} className={classes.listItem}>
				<ListItemIcon>{MAP_ICON_INS[text]}</ListItemIcon>
				<Typography variant="caption" color="inherit" className={classes.caption}>{MAP_TEXT_INS[text]}</Typography>
				</ListItem>
				))}
			</List>
			<Divider />

			<Typography variant="title" color="inherit" className={classes.grow}>Hotkeys number</Typography>
			
			<List>
			{
				labelselect.map(function(lb, _key_) {
					var spl = lb.id.split('-');
					var labelname = spl[0].charAt(0).toUpperCase() + spl[0].slice(1);
					var labeltype = spl[1].charAt(0).toUpperCase() + spl[1].slice(1);
					return (
						<ListItem button key={_key_} className={classes.listItem}>
						<ListItemIcon>{MAP_LABEL_INS[_key_]}</ListItemIcon>
						<Typography variant="caption" color="inherit" className={classes.caption}>{labelname + " | " + labeltype}</Typography>
						</ListItem>
						);}
					)
			}
			</List>

			<Typography variant="title" color="inherit" className={classes.grow}>Hotkeys control</Typography>
			
			<ListItem button className={classes.listItem}>
			<ListItemIcon>{MAP_ICON_INS['SHIFT']}</ListItemIcon>
			<Typography variant="caption" color="inherit" className={classes.caption}>{MAP_TEXT_INS['SHIFT']}</Typography>
			</ListItem>

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