import React from "react";
import { Avatar, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>({
  avatar: {
    flex: "0 0 auto",
  },
});

const ParticipantAvatar = ({ participant }: { participant: MeetingParticipant }) => {
  const classes = useStyles();

  return (
    <Tooltip key={participant.id} className={classes.avatar} title={participant.username}>
      <Avatar alt={participant.username} src={participant.imageUrl} />
    </Tooltip>
  );
};

export default ParticipantAvatar;
