import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { partition } from "lodash";
import { DateTime } from "luxon";

import { Group } from "../../../server/express/types/Group";
import GroupJoinCard from "./GroupJoinCard";
import RoomCard from "./RoomCard";
import theme from "../theme";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";

const useStyles = makeStyles<typeof theme, StyleProps>((theme) => ({
  root: (props) => ({
    opacity: props.isDisabled ? 0.6 : 1,
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
  card: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "25%",
    },
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
  },
}));

interface Props {
  group: Group;
  rooms: Room[];
  meetings: MeetingsIndexed;
}

interface StyleProps extends Props {
  isDisabled: boolean;
}

const RoomGrid = (props: Props) => {
  const { group, rooms, meetings } = props;

  const [isDisabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!group.disabledAfter && !group.disabledBefore) {
      return;
    }

    function calculateIsDisabled() {
      const now = DateTime.local();
      const isDisabledAfter = group.disabledAfter && DateTime.fromISO(group.disabledAfter) <= now;
      const isDisabledBefore = group.disabledBefore && DateTime.fromISO(group.disabledBefore) >= now;
      return isDisabledBefore || isDisabledAfter || false;
    }

    setDisabled(calculateIsDisabled());
    const handler = setInterval(() => setDisabled(calculateIsDisabled()), 10000);

    return () => clearInterval(handler);
  }, [group.disabledBefore, group.disabledAfter]);

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
