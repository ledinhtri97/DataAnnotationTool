import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    marginTop: '4em',
    marginBottom: '4em',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: '90%',
    height: 'auto',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
});

function ContributeItemsGrid(props) {
  const { classes } = props;
  const contribute_metas = JSON.parse(
      document.getElementById("contribute_metas").textContent
    )['contribute_metas'];

  contribute_metas.pop();

  return (
    <div className={classes.root}>
      <GridList cellHeight={280} className={classes.gridList}>
        <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
          <ListSubheader component="div">Contribute</ListSubheader>
        </GridListTile>
        {contribute_metas.map((mt, key) => (
          <GridListTile key={key}>
            <img src={mt.url_meta} alt="image" />
            <GridListTileBar
              title="title"
              actionIcon={
                <IconButton className={classes.icon}>
                  <InfoIcon />
                </IconButton>
              }
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

ContributeItemsGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContributeItemsGrid);