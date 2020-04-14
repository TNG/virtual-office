import { Box, Card, CardHeader } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import theme from "../theme";
import ParticipantAvatar from "./ParticipantAvatar";
import { Participant } from "../types/Participant";

const useStyles = makeStyles<typeof theme>((theme) => ({
  root: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
  },
  participant: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "33%",
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: Math.round(theme.breakpoints.width("lg") / 3),
    },
    flex: "0 0 auto",
    padding: 4,
    boxSizing: "border-box",
  },
}));

const ParticipantsList = ({ participants }: { participants: Participant[] }) => {
  const classes = useStyles();

  function renderParticipant(participant: Participant) {
    return (
      <Box key={participant.id} className={classes.participant}>
        <Card>
          <CardHeader
            avatar={<ParticipantAvatar participant={participant} />}
            title={participant.username}
            subheader={participant.email}
          />
        </Card>
      </Box>
    );
  }

  return <Box className={classes.root}>{participants.map(renderParticipant)}</Box>;
};

export default ParticipantsList;
