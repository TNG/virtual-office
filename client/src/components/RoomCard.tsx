import React from "react";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomWithParticipants } from "../types/RoomWithParticipants";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
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
        className={classes.header}
        avatar={room.icon ? <Avatar src={room.icon} /> : undefined}
        title={<Typography variant="h5">{room.name}</Typography>}
      />

      <CardContent className={classes.content}>
        <RoomParticipants name={room.name} participants={room.participants} />
        <RoomLinks links={room.links} />
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};
export default RoomCard;
