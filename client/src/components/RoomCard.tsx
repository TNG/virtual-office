import React from "react";
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    alignItems: "flex-start",
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 16,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    paddingTop: 0,
    paddingBottom: 4,
  },
  avatarGroup: {
    marginLeft: 8,
  },
  actions: {
    display: "flex",
    flexDirection: "row-reverse",
  },
});

const RoomCard = ({ room }: { room: RoomWithParticipants }) => {
  const classes = useStyles();

  function renderJoinUrl() {
    return (
      room.joinUrl && (
        <Button size="small" color="secondary" variant="text" href={room.joinUrl} target="_blank">
          Join
        </Button>
      )
    );
  }

  return (
    <Card className={classes.root} key={room.id}>
      <CardHeader
        classes={{ root: classes.header, title: classes.headerTitle, subheader: classes.headerSubtitle }}
        avatar={room.icon ? <Avatar src={room.icon} /> : undefined}
        title={room.name}
        subheader={room.subtitle}
      />
      <CardContent className={classes.content}>
        <RoomLinks links={room.links} />
        <Typography variant="subtitle2">Participants</Typography>
        <Box paddingLeft={1} paddingTop={1}>
          <RoomParticipants name={room.name} participants={room.participants} />
        </Box>
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};
export default RoomCard;
