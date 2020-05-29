import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Group } from "../../../server/express/types/Group";
import GroupIcon from "@material-ui/icons/QueuePlayNext";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.secondary.light,
  },
  header: {
    flex: "0 0 auto",
    minHeight: 40,
  },
  content: {
    flex: "1 1 auto",
    paddingTop: 0,
    paddingBottom: 4,
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
  isDisabled: boolean;
}

const GroupJoinCard = ({ group, isDisabled }: Props) => {
  const classes = useStyles();

  if (!group.groupJoin) {
    return null;
  }

  function renderJoinUrl() {
    const href = `/api/groups/${group.id}/join`;
    return (
      !isDisabled && (
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
