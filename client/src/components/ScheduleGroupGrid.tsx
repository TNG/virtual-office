import React from "react";
import { Card, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Group } from "../../../server/express/types/Group";
import GroupJoinCard from "./GroupJoinCard";
import RoomCard from "./RoomCard";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { partition } from "lodash";

const useStyles = makeStyles<Theme, Props>((theme) => ({
  root: {
    marginLeft: -8,
    marginRight: -8,
    padding: 4,
  },
  title: {
    color: "#000",
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
    padding: 4,
    boxSizing: "border-box",
  },
  responsiveCard: {
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
  groupHeaderCard: {
    opacity: (props) => (props.isDisabled ? 0.65 : 1),
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

const ScheduleGroupGrid = (props: Props) => {
  const { group, rooms, meetings, isDisabled, isJoinable, isListMode } = props;
  const classes = useStyles(props);

  function renderGridCard(key: string, card: any, responsive = false) {
    return (
      <div key={key} className={`${classes.card} ${responsive ? classes.responsiveCard : ""}`}>
        {card}
      </div>
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
          isListMode={isListMode}
        />,
        true
      );
    });
  }

  function renderGroupJoinCard() {
    return (
      group.groupJoin &&
      renderGridCard(
        `group-join-${group.id}`,
        <GroupJoinCard group={group} isJoinable={isJoinable} isDisabled={isDisabled} />
      )
    );
  }

  function renderGroupHeader() {
    return (
      group.name && (
        <div className={`${classes.card}`}>
          <Card className={`${classes.groupHeaderCard}`}>
            <CardHeader title={<Typography variant="h5">{group.name}</Typography>} />
          </Card>
        </div>
      )
    );
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

export default ScheduleGroupGrid;
