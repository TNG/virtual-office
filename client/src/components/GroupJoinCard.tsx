import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Group } from "../../../server/express/types/Group";
import SendIcon from "@material-ui/icons/EmojiPeople";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.secondary.light,
  },
  header: { height: 40 },
  content: {
    paddingTop: 0,
    paddingBottom: 4,
    flexGrow: 1,
  },
  avatarGroup: {
    marginLeft: 8,
  },
  actions: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  button: {
    margin: 4,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: theme.palette.background.paper,
  },
}));

const GroupJoinCard = ({ group }: { group: Group }) => {
  const classes = useStyles();

  function renderJoinUrl() {
    const href = `/api/groups/${group.id}/join`;
    return (
      <Button className={classes.button} size="small" color="secondary" variant="contained" href={href} target="_blank">
        Let's go
      </Button>
    );
  }

  return (
    <Card className={classes.root} key={group.id}>
      <CardHeader
        className={classes.header}
        avatar={<SendIcon className={classes.icon} color="primary" />}
        title={<Typography variant="h5">Join Group</Typography>}
      />

      <CardContent className={classes.content}>
        <Typography variant="body2">{group.groupJoin && group.groupJoin.description}</Typography>
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};

export default GroupJoinCard;
