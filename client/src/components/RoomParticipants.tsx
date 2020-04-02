import React from "react";
import { Box, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { sortBy } from "lodash";

import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import ParticipantAvatar from "./ParticipantAvatar";
import theme from "../theme";
import ParticipantsList from "./ParticipantsList";
import Dialog from "./Dialog";

const useStyles = makeStyles<typeof theme>((theme) => ({
  avatarGroup: {
    marginLeft: 8,
    cursor: "pointer",
  },
  emptyGroup: {
    color: theme.palette.grey.A200,
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

      <Dialog open={open} setOpen={setOpen} title={name}>
        <ParticipantsList participants={sortedParticipants} />
      </Dialog>
    </Box>
  );
};

export default RoomParticipants;
