import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Group } from "../../../server/express/types/Group";
import GroupIcon from "@material-ui/icons/QueuePlayNext";

/** Styles */
const useStyles = makeStyles<Theme, Props>((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 12,
    boxSizing: "border-box",
    height: (props) => (props.fillHeight ? "100%" : undefined),
    opacity: (props) => (props.isActive ? 1 : 0.65),
    backgroundColor: theme.palette.secondary.light,
  },
  header: {
    flex: "0 0 auto",
    padding: 0,
    minHeight: 40,
    alignItems: "flex-start",
  },
  content: {
    flex: "0 1 100%",
    padding: "4px 8px 0 8px",
    display: "flex",
    alignItems: "stretch",
    flexDirection: "column-reverse",
    justifyContent: (props) => (props.isListMode ? "space-between" : "flex-end"),
    "&:last-child": {
      padding: "0 8px",
    },

    [theme.breakpoints.up("sm")]: {
      alignItems: (props) => (props.isListMode ? "center" : "stretch"),
      flexDirection: (props) => (props.isListMode ? "row" : "column-reverse"),
    },
  },
  actions: {
    height: 44,
    padding: 0,
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
  button: {
    margin: "12px 4px 0",
  },
}));

/** Props */
interface Props {
  group: Group;
  isActive: boolean;
  isListMode: boolean;
  fillHeight?: boolean;
}

/** Component */
const GroupJoinCard = (props: Props) => {
  const { group, isActive } = props;
  const classes = useStyles(props);

  if (!group.groupJoinConfig) {
    return null;
  }

  function renderJoinUrl() {
    const href = `/api/groups/${group.name}/join`;
    return (
      isActive && (
        <Button
          className={classes.button}
          size="small"
          color="secondary"
          variant="contained"
          href={href}
          target="_blank"
        >
          Join Random
        </Button>
      )
    );
  }

  return (
    <Card className={classes.root} key={group.name}>
      <CardHeader
        className={classes.header}
        avatar={<GroupIcon color="action" fontSize="large" />}
        title={<Typography variant="h5">{group.groupJoinConfig.title}</Typography>}
        subheader={<Typography variant="body2">{group.groupJoinConfig.subtitle}</Typography>}
      />

      <CardContent className={classes.content}>
        <Typography variant="body2">{group.groupJoinConfig.description}</Typography>
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};

export default GroupJoinCard;
