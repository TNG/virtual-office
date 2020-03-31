import React from "react";

import { Avatar, Box, Tooltip, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { sortBy } from "lodash";
import theme from "../theme";

const useStyles = makeStyles({
  avatarGroup: {
    marginLeft: 8,
  },
  emptyGroup: {
    color: theme.palette.grey.A200,
  },
});

const RoomParticipants = ({ participants }: { participants: MeetingParticipant[] }) => {
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

  function getSortedParticipants() {
    return sortBy(participants, (participant) => participant.username);
  }

  return (
    <AvatarGroup className={classes.avatarGroup} max={5} spacing="medium">
      {getSortedParticipants().map((participant) => (
        <Tooltip key={participant.id} title={participant.username}>
          <Avatar alt={participant.username} src={participant.imageUrl} />
        </Tooltip>
      ))}
    </AvatarGroup>
  );
};

export default RoomParticipants;
