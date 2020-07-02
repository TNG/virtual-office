import { Card, CardHeader, Theme } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import ParticipantAvatar from "./ParticipantAvatar";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";

const useStyles = makeStyles<Theme>((theme) => ({
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

const ParticipantsList = ({ participants }: { participants: MeetingParticipant[] }) => {
  const classes = useStyles();

  function renderParticipant(participant: MeetingParticipant) {
    return (
      <div key={participant.id} className={classes.participant}>
        <Card>
          <CardHeader
            avatar={<ParticipantAvatar participant={participant} />}
            title={participant.username}
            subheader={participant.email}
          />
        </Card>
      </div>
    );
  }

  return <div className={classes.root}>{participants.map(renderParticipant)}</div>;
};

export default ParticipantsList;
