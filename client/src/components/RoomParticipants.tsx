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
}));

interface Props {
  name: string;
  participants: MeetingParticipant[];
  showParticipants: boolean;
  setShowParticipants: (open: boolean) => void;
}

const RoomParticipants = (props: Props) => {
  const [participantSearch, setParticipantSearch] = React.useState("");

  function handleSearch(searchText: string) {
    setParticipantSearch(searchText.toLowerCase());
  }

  function openDialog(open: boolean) {
    setParticipantSearch("");
    props.setShowParticipants(open);
  }

  const classes = useStyles();

  if (props.participants.length <= 0) {
    return (
      <Box height={44}>
        <Typography className={classes.emptyGroup} variant="body2">
          No one is here
        </Typography>
      </Box>
    );
  }

  if (ANONYMOUS_PARTICIPANTS) {
    return (
      <Box height={44}>
        <Typography variant="body2" className={classes.anonymousParticipantsText}>
          {props.participants.length} participant{props.participants.length > 1 ? "s" : ""}
        </Typography>
      </Box>
    );
  }

  const sortedParticipants = sortBy(props.participants, (participant) => participant.username);
  const filteredParticipants = sortedParticipants.filter((participant) =>
    participantMatches(participantSearch, participant)
  );

  return (
    <Box>
      <AvatarGroup className={classes.avatarGroup} max={5} onClick={() => props.setShowParticipants(true)}>
        {sortedParticipants.map((participant, index) => (
          <ParticipantAvatar
            key={participant.id}
            participant={participant}
            zIndex={sortedParticipants.length - index}
          />
        ))}
      </AvatarGroup>

      <Dialog
        open={props.showParticipants}
        setOpen={openDialog}
        title={props.name}
        variant="big"
        handleOk={() => props.setShowParticipants(false)}
        handleSearch={debounce(handleSearch, 200)}
      >
        <ParticipantsList participants={filteredParticipants} />
      </Dialog>
    </Box>
  );
};

export default RoomParticipants;
