import React from "react";
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import RoomIcon from "@material-ui/icons/PersonalVideo";

const useStyles = makeStyles<Theme, Props>((theme) => ({
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
    justifyContent: "space-between",
    alignItems: "stretch",
    flexDirection: "column",

    [theme.breakpoints.up("sm")]: {
      flexDirection: (props) => (props.isListMode ? "row" : "column"),
      alignItems: (props) => (props.isListMode ? "center" : "stretch"),
    },
  },
  content: {
    flex: "0 1 100%",
    paddingTop: 0,
    paddingBottom: 0,
    display: "flex",
    alignItems: "stretch",
    flexDirection: "column-reverse",
    justifyContent: "space-between",

    [theme.breakpoints.up("sm")]: {
      alignItems: (props) => (props.isListMode ? "center" : "stretch"),
      flexDirection: (props) => (props.isListMode ? "row" : "column-reverse"),
    },
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
}));

interface Props {
  room: Room;
  participants: MeetingParticipant[];
  isDisabled: boolean;
  isJoinable: boolean;
  isListMode: boolean;
}

const RoomCard = (props: Props) => {
  const classes = useStyles(props);
  const { room, participants, isDisabled, isJoinable, isListMode } = props;
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

  const roomLinksView = (room.links ?? []).length > 0 && <RoomLinks links={room.links} isListMode={isListMode} />;
  const participantsView = (!isDisabled || isJoinable) && (
    <Box className={classes.participants}>
      <RoomParticipants
        name={room.name}
        participants={participants}
        showParticipants={participantsOpen}
        setShowParticipants={setParticipantsOpen}
      />
    </Box>
  );

  const joinUrlView = renderJoinUrl();
  const detailsView = renderDetails();

  const bodyView = (roomLinksView || participantsView || joinUrlView || detailsView) && (
    <Box className={classes.body}>
      <CardContent className={classes.content}>
        {roomLinksView}
        {participantsView}
      </CardContent>

      <CardActions className={classes.actions}>
        {joinUrlView}
        {detailsView}
      </CardActions>
    </Box>
  );

  return (
    <Card className={classes.root} key={room.roomId}>
      <CardHeader
        className={classes.header}
        avatar={room.icon ? <Avatar variant="square" src={room.icon} /> : <RoomIcon color="action" />}
        title={<Typography variant="h5">{room.name}</Typography>}
        subheader={<Typography variant="body2">{room.subtitle}</Typography>}
      />

      {bodyView}
    </Card>
  );
};
export default RoomCard;
