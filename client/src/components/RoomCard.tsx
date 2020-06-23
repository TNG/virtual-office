import React from "react";
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import RoomIcon from "@material-ui/icons/PersonalVideo";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 8,
  },
  border: {
    border: "3px solid rgb(44, 106, 168)",
  },
  header: {
    flex: "1 1 auto",
    padding: 0,
    minHeight: 40,
  },
  content: {
    flex: "0 0 auto",
    flexDirection: "row",
    paddingTo: 0,
  },
  links: {
    flex: "0 1 auto",
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
      <Box display="flex">
        <CardHeader
          className={classes.header}
          avatar={room.icon ? <Avatar variant="square" src={room.icon} /> : <RoomIcon color="action" />}
          title={<Typography variant="h5">{room.name}</Typography>}
          subheader={<Typography variant="body2">{room.subtitle}</Typography>}
        />

        <CardActions className={classes.actions}>
          {renderJoinUrl()}
          {renderDetails()}
        </CardActions>
      </Box>
      <Box display="flex">
        <RoomLinks links={room.links} />
        {(!isDisabled || isJoinable) && (
          <RoomParticipants
            name={room.name}
            participants={participants}
            showParticipants={participantsOpen}
            setShowParticipants={setParticipantsOpen}
          />
        )}
      </Box>
    </Card>
  );
};
export default RoomCard;
