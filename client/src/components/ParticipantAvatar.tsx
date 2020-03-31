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
  function getInitialsFrom(username: string) {
    return username
      .split(" ")
      .map((part) => part.toUpperCase())
      .map((part) => part.substring(0, 1))
      .slice(0, 2)
      .join("");
  }

  // function taken from https://github.com/mui-org/material-ui/issues/12700
  function stringToColor(text: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < text.length; i += 1) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  const initials = getInitialsFrom(participant.username);
  const backgroundColor = stringToColor(participant.username);
  const textColor = theme.palette.getContrastText(backgroundColor);
  const classes = useStyles();
  const avatarColorStyle = participant.imageUrl ? undefined : { color: textColor, backgroundColor };

  return (
    <Tooltip key={participant.id} className={classes.avatar} title={participant.username}>
      <Avatar alt={participant.username} src={participant.imageUrl} style={avatarColorStyle}>
        {initials}
      </Avatar>
    </Tooltip>
  );
};

export default ParticipantAvatar;
