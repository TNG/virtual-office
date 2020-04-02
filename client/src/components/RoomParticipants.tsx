import React from "react";
import { Box, Card, CardContent, CardHeader, Modal, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { sortBy } from "lodash";

import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import ParticipantAvatar from "./ParticipantAvatar";
import theme from "../theme";
import ParticipantsList from "./ParticipantsList";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles<typeof theme>((theme) => ({
  avatarGroup: {
    marginLeft: 8,
    cursor: "pointer",
  },
  emptyGroup: {
    color: theme.palette.grey.A200,
  },

  dialog: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    width: "100%",
    height: "100%",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    borderRadius: 0,
    [theme.breakpoints.up("sm")]: {
      width: "90%",
      height: "85%",
      top: "10%",
      right: "5%",
      left: "5%",
      bottom: "5%",
      borderRadius: 4,
    },
    outline: "none",
  },
  dialogAction: {
    margin: 0,
    cursor: "pointer",
  },
  dialogHeader: {
    flex: "0 0 auto",
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

  const sortedParticipants = sortBy(participants, (participant) => participant.username);

  return (
    <Box>
      <AvatarGroup className={classes.avatarGroup} max={5} onClick={() => setOpen(true)}>
        {sortedParticipants.map((participant, index) => (
          <ParticipantAvatar
            key={participant.id}
            participant={participant}
            zIndex={sortedParticipants.length - index}
          />
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
            className={classes.dialogHeader}
            title={<Typography variant="h5">{name}</Typography>}
            action={<CloseIcon color="action" fontSize="default" onClick={() => setOpen(false)} />}
            classes={{ action: classes.dialogAction }}
          />

          <CardContent>
            <ParticipantsList participants={sortedParticipants} />
          </CardContent>
        </Card>
      </Modal>
    </Box>
  );
};

export default RoomParticipants;
