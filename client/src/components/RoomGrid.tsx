import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { partition } from "lodash";

import { Group } from "../../../server/express/types/Group";
import GroupJoinCard from "./GroupJoinCard";
import RoomCard from "./RoomCard";
import theme from "../theme";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";

const useStyles = makeStyles<typeof theme, StyleProps>((theme) => ({
  root: (props) => ({
    opacity: props.isDisabled ? "0.5" : "1",
  }),
  title: {
    margin: 12,
    marginTop: 24,
    padding: 0,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  hidden: {
    opacity: 0.4,
  },
  card: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "20%",
    },
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
  },
}));

interface Props {
  group: Group;
  rooms: (Room & { shouldFocus?: boolean })[];
  meetings: MeetingsIndexed;
}

interface StyleProps extends Props {
  isDisabled: boolean;
}

const RoomGrid = (props: Props) => {
  const { group, rooms, meetings } = props;

  const [isDisabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!group.disableAfter && !group.disableBefore) {
      return;
    }

    function calculateIsDisabled() {
      const now = new Date();
      const isDisabledAfter = group.disableAfter && new Date(group.disableAfter) <= now;
      const isDisabledBefore = group.disableBefore && new Date(group.disableBefore) >= now;
      return isDisabledBefore || isDisabledAfter || false;
    }

    setDisabled(calculateIsDisabled());
    const handler = setInterval(() => setDisabled(calculateIsDisabled()), 10000);

    return () => clearInterval(handler);
  }, [group.disableBefore, group.disableAfter]);

  const classes = useStyles({ ...props, isDisabled });

  function renderGridCard(key: string, card: any) {
    return (
      <Box key={key} className={classes.card}>
        {card}
      </Box>
    );
  }

  function participantsInMeeting(meetingId: string): MeetingParticipant[] {
    if (meetings[meetingId]) {
      return meetings[meetingId].participants;
    }
    return [];
  }

  function selectShownRooms() {
    if (!group.groupJoin) {
      return rooms;
    }

    const [emptyRooms, filledRooms] = partition(rooms, (room) => participantsInMeeting(room.meetingId).length === 0);
    return [...filledRooms, ...emptyRooms.slice(0, 1)];
  }

  function renderRoomCards() {
    const shownRooms = selectShownRooms();
    return shownRooms.map((room) => {
      const participants = participantsInMeeting(room.meetingId);
      return renderGridCard(room.roomId, <RoomCard room={room} participants={participants} isDisabled={isDisabled} />);
    });
  }

  function renderGroupJoinCard() {
    return (
      group.groupJoin &&
      renderGridCard(`group-join-${group.id}`, <GroupJoinCard group={group} isDisabled={isDisabled} />)
    );
  }

  function renderGroupHeader() {
    return group.name && <h2 className={`${classes.title} ${isDisabled ? classes.hidden : ""}`}>{group.name}</h2>;
  }

  return (
    <Box className={classes.root}>
      {renderGroupHeader()}

      <Box className={classes.grid}>
        {renderGroupJoinCard()}
        {renderRoomCards()}
      </Box>
    </Box>
  );
};

export default RoomGrid;
