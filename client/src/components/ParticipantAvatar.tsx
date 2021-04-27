import React from "react";
import { Avatar, Theme, Tooltip, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Participant } from "../../../server/types/Meeting";

const useStyles = makeStyles<Theme>({
  avatar: {
    flex: "0 0 auto",
    marginLeft: -8,
    border: "2px solid #fafafa",
  },
});

const ParticipantAvatar = ({ participant, zIndex }: { participant: Participant; zIndex?: number }) => {
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
  const classes = useStyles();
  const theme = useTheme();
  const textColor = theme.palette.getContrastText(backgroundColor);

  const avatarStyle = {
    zIndex: zIndex || 1,
    ...(participant.imageUrl ? {} : { color: textColor, backgroundColor }),
  };
  return (
    <Tooltip key={participant.id} className={classes.avatar} title={participant.username}>
      <Avatar alt={participant.username} src={participant.imageUrl} style={avatarStyle}>
        {initials}
      </Avatar>
    </Tooltip>
  );
};

export default ParticipantAvatar;
