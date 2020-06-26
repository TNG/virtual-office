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
    padding: 12,
  },
  border: {
    border: "3px solid rgb(44, 106, 168)",
  },
  header: {
    flex: "1 1 auto",
    padding: 0,
    minHeight: 40,
  },
  body: {
    flex: "1 0 auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: "0 1 100%",
    padding: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  links: {
    flex: "1 1 auto",
  },
  participants: {
    flex: "0 0 auto",
    marginRight: 8,
  },
  avatarGroup: {
    marginLeft: 8,
  },
  actions: {
    height: 44,
    padding: 0,
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

      <Box className={classes.body}>
        <CardContent className={classes.content}>
          <RoomLinks links={room.links} />
          {(!isDisabled || isJoinable) && (
            <Box className={classes.participants}>
              <RoomParticipants
                name={room.name}
                participants={participants}
                showParticipants={participantsOpen}
                setShowParticipants={setParticipantsOpen}
              />
            </Box>
          )}
        </CardContent>

        <CardActions className={classes.actions}>
          {renderJoinUrl()}
          {renderDetails()}
        </CardActions>
      </Box>
    </Card>
  );
};
export default RoomCard;
