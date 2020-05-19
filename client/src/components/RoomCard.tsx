import React from "react";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";

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

const RoomCard = ({ room, participants }: { room: Room; participants: MeetingParticipant[] }) => {
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
    <Card className={classes.root} key={room.roomId}>
      <CardHeader
        classes={{ root: classes.header, title: classes.headerTitle }}
        avatar={room.icon ? <Avatar src={room.icon} /> : undefined}
        title={room.name}
      />
      {room.joinUrl ? (
        <CardContent className={classes.content}>
          <RoomParticipants name={room.name} participants={participants} />
          <RoomLinks links={room.links} />
        </CardContent>
      ) : (
        ""
      )}
      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};
export default RoomCard;
