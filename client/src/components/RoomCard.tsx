import React from "react";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import RoomIcon from "@material-ui/icons/PersonalVideo";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
  },
  border: {
    border: "3px solid rgb(44, 106, 168)",
  },
  header: {
    flex: "0 0 auto",
    minHeight: 40,
  },
  content: {
    flex: "1 1 auto",
    paddingTop: 0,
    paddingBottom: 4,
  },
  avatarGroup: {
    marginLeft: 8,
  },
  actions: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "row-reverse",
  },
});

interface Props {
  room: Room;
  participants: MeetingParticipant[];
  isDisabled: boolean;
  isJoinable: boolean;
}

const RoomCard = (props: Props) => {
  const classes = useStyles(props);
  const { room, participants, isDisabled, isJoinable } = props;
  const [participantsOpen, setParticipantsOpen] = React.useState(false);
  function renderJoinUrl() {
    return (
      room.joinUrl &&
      isJoinable && (
        <Button size="small" color="secondary" variant="text" href={room.joinUrl} target="_blank">
          Join
        </Button>
      )
    );
  }

  function renderDetails() {
    return (
      !isDisabled &&
      participants.length > 0 && (
        <Button size="small" color="secondary" variant="text" onClick={() => setParticipantsOpen(true)}>
          Details
        </Button>
      )
    );
  }

  return (
    <Card className={classes.root} key={room.roomId}>
      <CardHeader
        className={classes.header}
        avatar={room.icon ? <Avatar variant="square" src={room.icon} /> : <RoomIcon color="action" />}
        title={<Typography variant="h5">{room.name}</Typography>}
        subheader={<Typography variant="body2">{room.subtitle}</Typography>}
      />
      <CardContent className={classes.content}>
        {(!isDisabled || isJoinable) && (
          <RoomParticipants
            name={room.name}
            participants={participants}
            showParticipants={participantsOpen}
            setShowParticipants={setParticipantsOpen}
          />
        )}
        <RoomLinks links={room.links} />
      </CardContent>
      <CardActions className={classes.actions}>
        {renderJoinUrl()}
        {renderDetails()}
      </CardActions>
    </Card>
  );
};
export default RoomCard;
