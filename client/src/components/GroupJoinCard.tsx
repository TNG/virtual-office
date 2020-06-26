import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Group } from "../../../server/express/types/Group";
import GroupIcon from "@material-ui/icons/QueuePlayNext";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: theme.palette.secondary.light,
  },
  header: {
    flex: "0 0 auto",
    minHeight: 40,
  },
  content: {
    display: "flex",
    flex: "1 1 auto",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    flexGrow: 1,
  },
  actions: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  avatarGroup: {
    marginLeft: 8,
  },
  button: {
    margin: 4,
  },
}));

interface Props {
  group: Group;
  isJoinable: boolean;
}

const GroupJoinCard = ({ group, isJoinable }: Props) => {
  const classes = useStyles();

  if (!group.groupJoin) {
    return null;
  }

  function renderJoinUrl() {
    const href = `/api/groups/${group.id}/join`;
    return (
      isJoinable && (
        <Button
          className={classes.button}
          size="small"
          color="secondary"
          variant="contained"
          href={href}
          target="_blank"
        >
          Join
        </Button>
      )
    );
  }

  return (
    <Card className={classes.root} key={group.id}>
      <CardHeader
        className={classes.header}
        avatar={<GroupIcon color="action" />}
        title={<Typography variant="h5">{group.groupJoin.title}</Typography>}
        subheader={<Typography variant="body2">{group.groupJoin.subtitle}</Typography>}
      />

      <CardContent className={classes.content}>
        <Typography variant="body2">{group.groupJoin.description}</Typography>
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};

export default GroupJoinCard;
