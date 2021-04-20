import React, { useEffect } from "react";
import { Theme, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { debounce, sortBy } from "lodash";

import ParticipantAvatar from "./ParticipantAvatar";
import ParticipantsList from "./ParticipantsList";
import Dialog from "./Dialog";
import { participantMatches, participantMatchesSearch } from "../search";
import { useQuery } from "@apollo/client";
import { GET_PARTICIPANTS_IN_MEETING_COMPLETE, PARTICIPANT_MUTATED_SUBSCRIPTION } from "../apollo/gqlQueries";
import { ParticipantApollo } from "../../../server/apollo/TypesApollo";

const ANONYMOUS_PARTICIPANTS = (import.meta as any).env.SNOWPACK_PUBLIC_ANONYMOUS_PARTICIPANTS === "true";
const useStyles = makeStyles<Theme>((theme) => ({
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
  userParticipant: {
    height: 44,
    display: "flex",
    alignItems: "center",
  },
  anonymousParticipant: {
    height: 44,
  },
}));

interface Props {
  roomName: string;
  meetingId: string;
  showParticipants: boolean;
  setShowParticipants: (open: boolean) => void;
}

const RoomParticipants = (props: Props) => {
  const { roomName, meetingId, showParticipants, setShowParticipants } = props;

  const [participantSearch, setParticipantSearch] = React.useState("");

  function handleSearch(searchText: string) {
    setParticipantSearch(searchText.toLowerCase());
  }

  function openDialog(open: boolean) {
    setParticipantSearch("");
    setShowParticipants(open);
  }

  function subscribeToParticipantMutations() {
    subscribeToMore({
      document: PARTICIPANT_MUTATED_SUBSCRIPTION,
      variables: { meetingId: meetingId },
      updateQuery: (currentData, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return currentData;
        }
        if (subscriptionData.data.participantMutated.mutationType === "PARTICIPANT_ADDED") {
          return {
            getParticipantsInMeeting: [
              ...currentData.getParticipantsInMeeting,
              subscriptionData.data.participantMutated.participant,
            ],
          };
        } else if (subscriptionData.data.participantMutated.mutationType === "PARTICIPANT_REMOVED") {
          return {
            getParticipantsInMeeting: currentData.getParticipantsInMeeting.filter(
              (participant: ParticipantApollo) =>
                participant.id !== subscriptionData.data.participantMutated.participant.id
            ),
          };
        } else {
          return currentData;
        }
      },
    });
  }

  const classes = useStyles();

  const { subscribeToMore, data, loading, error } = useQuery(GET_PARTICIPANTS_IN_MEETING_COMPLETE, {
    variables: { id: meetingId },
  });

  useEffect(() => {
    subscribeToParticipantMutations();
  }, []);

  if (!data) return null;

  if (data.getParticipantsInMeeting.length <= 0) {
    return (
      <div className={classes.userParticipant}>
        <Typography className={classes.emptyGroup} variant="body2">
          No one is here
        </Typography>
      </div>
    );
  }

  if (ANONYMOUS_PARTICIPANTS) {
    return (
      <div className={classes.anonymousParticipant}>
        <Typography variant="body2" className={classes.anonymousParticipantsText}>
          {data.getParticipantsInMeeting.length} participant{data.getParticipantsInMeeting.length > 1 ? "s" : ""}
        </Typography>
      </div>
    );
  }

  const sortedParticipants = sortBy(data.getParticipantsInMeeting, (participant) => participant.username);
  const filteredParticipants = sortedParticipants.filter((participant) =>
    participantMatchesSearch(participant, participantSearch)
  );

  return (
    <div>
      <AvatarGroup className={classes.avatarGroup} max={5} onClick={() => setShowParticipants(true)}>
        {sortedParticipants.map((participant, index) => (
          <ParticipantAvatar
            key={participant.id}
            participant={participant}
            zIndex={sortedParticipants.length - index}
          />
        ))}
      </AvatarGroup>

      <Dialog
        open={showParticipants}
        setOpen={openDialog}
        title={roomName}
        variant="big"
        handleOk={() => setShowParticipants(false)}
        handleSearch={debounce(handleSearch, 200)}
      >
        <ParticipantsList participants={filteredParticipants} />
      </Dialog>
    </div>
  );
};

export default RoomParticipants;
