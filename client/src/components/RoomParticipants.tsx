import React from "react";
import { Box, Card, CardContent, CardHeader, Modal, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import CloseIcon from "@material-ui/icons/Close";
import { sortBy } from "lodash";

import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import ParticipantAvatar from "./ParticipantAvatar";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  avatarGroup: {
    marginLeft: 8,
    cursor: "pointer",
  },
  avatar: {
    flex: "0 0 auto",
  },
  emptyGroup: {
    color: theme.palette.grey.A200,
  },
  dialog: {
    position: "fixed",
    width: "100%",
    height: "100%",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    borderRadius: 0,
    [theme.breakpoints.up("sm")]: {
      width: "80%",
      height: "80%",
      top: "10%",
      right: "10%",
      left: "10%",
      bottom: "10%",
      borderRadius: 4,
    },
    outline: "none",
    overflowX: "auto",
  },
  dialogAction: {
    margin: 0,
    cursor: "pointer",
  },
  participant: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    margin: 3,
  },
  participantData: {
    flex: "1 0 auto",
    marginLeft: 12,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    height: "100%",
  },
}));

const RoomParticipants = ({ name, participants }: { name: string; participants: MeetingParticipant[] }) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  if (participants.length <= 0) {
    return (
      <Box height={44}>
        <Typography className={classes.emptyGroup} variant="body2">
          No one is here
        </Typography>
      </Box>
    );
  }

  function renderParticipant(participant: MeetingParticipant) {
    return (
      <Card key={participant.id} className={classes.participant}>
        <CardHeader
          avatar={<ParticipantAvatar participant={participant} />}
          title={participant.username}
          subheader={participant.email}
        />
      </Card>
    );
  }

  const sortedParticipants = sortBy(participants, (participant) => participant.username);

  return (
    <Box>
      <AvatarGroup className={classes.avatarGroup} max={5} onClick={() => setOpen(true)}>
        {sortedParticipants.map((participant, index) => (
          <ParticipantAvatar participant={participant} zIndex={sortedParticipants.length - index} />
        ))}
      </AvatarGroup>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Card className={classes.dialog}>
          <CardHeader
            title={<Typography variant="h5">{name}</Typography>}
            action={<CloseIcon color="action" fontSize="default" onClick={() => setOpen(false)} />}
            classes={{ action: classes.dialogAction }}
          />

          <CardContent className={classes.grid}>{sortedParticipants.map(renderParticipant)}</CardContent>
        </Card>
      </Modal>
    </Box>
  );
};

export default RoomParticipants;
