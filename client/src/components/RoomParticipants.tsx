import React from "react";
import { Box, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { debounce, sortBy } from "lodash";

import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import ParticipantAvatar from "./ParticipantAvatar";
import theme from "../theme";
import ParticipantsList from "./ParticipantsList";
import Dialog from "./Dialog";
import { participantMatches } from "../search";

const ANONYMOUS_PARTICIPANTS = process.env.REACT_APP_ANONYMOUS_PARTICIPANTS === "true";
const useStyles = makeStyles<typeof theme>((theme) => ({
  avatarGroup: {
    marginLeft: 8,
    cursor: "pointer",
  },
  anonymousParticipantsText: {
    fontWeight: 600,
  },
  emptyGroup: {
    color: theme.palette.grey.A200,
  },
  crowdContainer: {
    paddingTop: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  crowdImage: {
    height: 56,
  },
}));

const RoomParticipants = (props: { name: string; participants: MeetingParticipant[] }) => {
  const [open, setOpen] = React.useState(false);
  const [participantSearch, setParticipantSearch] = React.useState("");

  function handleSearch(searchText: string) {
    setParticipantSearch(searchText.toLowerCase());
  }

  function openDialog(open: boolean) {
    setParticipantSearch("");
    setOpen(open);
  }

  const classes = useStyles();

  if (props.participants.length <= 0) {
    return (
      <Box>
        <Box className={classes.crowdContainer}>
          <img src="/images/crowd/crowd_0.png" className={classes.crowdImage} />
          <Typography className={classes.emptyGroup} variant="subtitle2">
            No one is here
          </Typography>
        </Box>
      </Box>
    );
  }

  function renderCrowd(numberOfParticipants: number) {
    if (numberOfParticipants <= 1) {
      return <img src="/images/crowd/crowd_1.png" className={classes.crowdImage} />;
    } else if (numberOfParticipants <= 2) {
      return <img src="/images/crowd/crowd_2.png" className={classes.crowdImage} />;
    } else if (numberOfParticipants <= 10) {
      return <img src="/images/crowd/crowd_3.png" className={classes.crowdImage} />;
    } else if (numberOfParticipants <= 50) {
      return <img src="/images/crowd/crowd_5.png" className={classes.crowdImage} />;
    } else if (numberOfParticipants <= 100) {
      return <img src="/images/crowd/crowd_7.png" className={classes.crowdImage} />;
    } else {
      return <img src="/images/crowd/crowd_9.png" className={classes.crowdImage} />;
    }
  }

  if (ANONYMOUS_PARTICIPANTS) {
    const viewerCount = props.participants.length;
    return (
      <Box>
        <Box className={classes.crowdContainer}>
          {renderCrowd(viewerCount)}
          <Typography variant="subtitle2">
            {viewerCount} viewer{viewerCount > 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>
    );
  }

  const sortedParticipants = sortBy(props.participants, (participant) => participant.username);
  const filteredParticipants = sortedParticipants.filter((participant) =>
    participantMatches(participantSearch, participant)
  );

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

      <Dialog
        open={open}
        setOpen={openDialog}
        title={props.name}
        variant="big"
        handleOk={() => setOpen(false)}
        handleSearch={debounce(handleSearch, 200)}
      >
        <ParticipantsList participants={filteredParticipants} />
      </Dialog>
    </Box>
  );
};

export default RoomParticipants;
