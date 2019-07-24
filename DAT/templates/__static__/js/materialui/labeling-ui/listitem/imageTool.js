import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import Button from '@material-ui/core/Button';

import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
	scaleCanvas: {
		paddingTop: '5px',
		paddingBottom: '5px',
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignContent: 'center',
	},
    sliderS: {
        width: '70%',
    },
    splitTool:{
        width: '100%',
        height: 3,
        background: '#4285F4',
        padding: 0,
    },
});

const PrettoSlider = withStyles({
  root: {
    color: '#52af77',
    height: 6,
  },
  thumb: {
    height: 18,
    width: 18,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -6,
    marginLeft: -6,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

class ImageTool extends React.Component {

    state = {
        open: false,
    };

    contextMenu = function(e) {
        e.preventDefault();
        return false;
    };

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ open: false });
    };

    zoomIt = () => {
        var factor = 0.5;
        canvas.setHeight(canvas.getHeight() * factor);
        canvas.setWidth(canvas.getWidth() * factor);
        if (canvas.backgroundImage) {
            // Need to scale background images as well
            var bi = canvas.backgroundImage;
            bi.scaleToWidth(canvas.getHeight());
            bi.scaleToHeight(canvas.getWidth());
        }
        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * factor;
            var tempScaleY = scaleY * factor;
            var tempLeft = left * factor;
            var tempTop = top * factor;

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }
        canvas.renderAll();
        canvas.calcOffset();
    }

    render() {
        const { classes, drawTool, drawStatus } = this.props;
        const tool = this;

        return(
            <div>

            <div><ListItem button className={classes.splitTool}></ListItem></div>


            <div className={classes.scaleCanvas}>
            	<div className={classes.sliderS}>
	            	<PrettoSlider
	            		valueLabelDisplay="auto" 
	            		aria-label="Pretto slider" 
	            		defaultValue={100}
	            		min={30} />
            	</div>
            </div>

            </div>
        )
    };
}

ImageTool.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ImageTool);