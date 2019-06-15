import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AssignmentTurnedIn from '@material-ui/icons/AssignmentTurnedIn';
import Loyalty from '@material-ui/icons/Loyalty';
import Redo from '@material-ui/icons/Redo';
import NotificationsActive from '@material-ui/icons/NotificationsActive';
import Typography from '@material-ui/core/Typography';

import SubmittedTable from './table/table-submitted';
import FlagFalsePredictTable from './table/table-flagfalsepredict';
import SkippedTable from './table/table-skipped';
import NoticeReviewTable from './table/table-noticereview';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: '1em',
    backgroundColor: theme.palette.background.paper,
  },
});

class TabShowLabels extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes, submitted, flaged, skipped, notice_review, isAdmin } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            variant="scrollable"
            scrollButtons="on"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Submitted" icon={<AssignmentTurnedIn />} />
            <Tab label="Flag false predict" icon={<Loyalty />} />
            <Tab label="Skipped" icon={<Redo />} />
            <Tab label="Notice Review" icon={<NotificationsActive />} />
          </Tabs>
        </AppBar>
        {value === 0 && <TabContainer><SubmittedTable submitted={submitted}/></TabContainer>}
        {value === 1 && <TabContainer><FlagFalsePredictTable flaged={flaged} isAdmin={isAdmin}/></TabContainer>}
        {value === 2 && <TabContainer><SkippedTable skipped={skipped}/></TabContainer>}
        {value === 3 && <TabContainer><NoticeReviewTable notice_review={notice_review}/></TabContainer>}
      </div>
    );
  }
}

TabShowLabels.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TabShowLabels);