import React from "react";
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

const useStyles = makeStyles<typeof theme>((theme) => ({
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
      width: "20%",
    },
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
  },
}));

const RoomGrid = ({
  group,
  rooms,
  meetings,
}: {
  group: Group;
  rooms: (Room & { shouldFocus?: boolean })[];
  meetings: MeetingsIndexed;
}) => {
  const classes = useStyles();

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
      return renderGridCard(room.roomId, <RoomCard room={room} participants={participants} />);
    });
  }

  function renderGroupJoinCard() {
    return group.groupJoin && renderGridCard(`group-join-${group.id}`, <GroupJoinCard group={group} />);
  }

  function renderGroupHeader() {
    return group.name && <h2 className={classes.title}>{group.name}</h2>;
  }

  return (
    <Box>
      {renderGroupHeader()}

      <Box className={classes.grid}>
        {renderGroupJoinCard()}
        {renderRoomCards()}
      </Box>
    </Box>
  );
};

export default RoomGrid;
