import React from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Group } from "../../../server/express/types/Group";
import GroupJoinCard from "./GroupJoinCard";
import RoomCard from "./RoomCard";
import theme from "../theme";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { partition } from "lodash";
import { ClientConfig } from "../socket/SocketService";

const useStyles = makeStyles<typeof theme, Props>((theme) => ({
  title: {
    color: "#fff",
    margin: 12,
    marginTop: 24,
    padding: 0,
    opacity: (props) => (props.isDisabled ? 0.9 : 1),
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
    opacity: (props) => (props.isDisabled ? 0.65 : 1),
  },
  card: {
    width: "100%",
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
  },
  responsiveCard: {
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "33%",
    },
    [theme.breakpoints.up("lg")]: {
      width: "33%",
    },
    [theme.breakpoints.up("xl")]: {
      width: "25%",
    },
  },
}));

interface Props {
  group: Group;
  rooms: Room[];
  meetings: MeetingsIndexed;
  isDisabled: boolean;
  isJoinable: boolean;
  isListMode: boolean;
}

const RoomGrid = (props: Props) => {
  const { group, rooms, meetings, isDisabled, isJoinable, isListMode } = props;
  const classes = useStyles(props);

  function renderGridCard(key: string, card: any, responsive = false) {
    return (
      <Box key={key} className={`${classes.card} ${responsive ? classes.responsiveCard : ""}`}>
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

    if (!isJoinable) {
      return [];
    }

    const [emptyRooms, filledRooms] = partition(rooms, (room) => participantsInMeeting(room.meetingId).length === 0);
    return [...filledRooms, ...emptyRooms.slice(0, 1)];
  }

  function renderRoomCards() {
    const shownRooms = selectShownRooms();
    return shownRooms.map((room) => {
      const participants = participantsInMeeting(room.meetingId);
      return renderGridCard(
        room.roomId,
        <RoomCard
          room={room}
          participants={participants}
          isDisabled={isDisabled}
          isJoinable={isJoinable}
          isListMode={!group.groupJoin && isListMode}
        />,
        !!group.groupJoin
      );
    });
  }

  function renderGroupJoinCard() {
    return (
      group.groupJoin &&
      renderGridCard(`group-join-${group.id}`, <GroupJoinCard group={group} isJoinable={isJoinable} />)
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
