import React from "react";
import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { GroupLegacy } from "../../../server/express/types/GroupLegacy";
import GroupJoinCard from "./GroupJoinCard";
import RoomCard from "./RoomCard";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { RoomLegacy } from "../../../server/express/types/RoomLegacy";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { partition } from "lodash";

const useStyles = makeStyles<Theme, Props>((theme) => ({
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
  },
  card: {
    width: "100%",
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "33.33%",
    },
    [theme.breakpoints.up("lg")]: {
      width: "33.33%",
    },
    [theme.breakpoints.up("xl")]: {
      width: "25%",
    },
  },
}));

interface Props {
  group: GroupLegacy;
  rooms: RoomLegacy[];
  meetings: MeetingsIndexed;
  isDisabled: boolean;
  isJoinable: boolean;
  isListMode: boolean;
}

const RoomGrid = (props: Props) => {
  const { group, rooms, meetings, isDisabled, isJoinable, isListMode } = props;
  const classes = useStyles(props);

  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }

  function participantsInMeeting(meetingId: string | undefined): MeetingParticipant[] {
    if (meetingId && meetings[meetingId]) {
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
          isListMode={isListMode}
          fillHeight={true}
        />
      );
    });
  }

  function renderGroupJoinCard() {
    if (!group.groupJoin) {
      return;
    }

    return renderGridCard(
      `group-join-${group.id}`,
      <GroupJoinCard group={group} isJoinable={isJoinable} isListMode={isListMode} fillHeight={true} />
    );
  }

  function renderGroupHeader() {
    return group.name && <h2 className={`${classes.title} ${isDisabled ? classes.hidden : ""}`}>{group.name}</h2>;
  }

  return (
    <div className={classes.root}>
      {renderGroupHeader()}

      <div className={classes.grid}>
        {renderGroupJoinCard()}
        {renderRoomCards()}
      </div>
    </div>
  );
};

export default RoomGrid;
