import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import RoomCard from "./RoomCard";
import { Room } from "../../../server/express/types/Room";
import { partition } from "lodash";
import { RoomLegacy } from "../../../server/express/types/RoomLegacy";
import GroupJoinCard from "./GroupJoinCard";
import { GroupLegacy } from "../../../server/express/types/GroupLegacy";
import { Group } from "../../../server/express/types/Group";

/** Styles */
const useStyles = makeStyles<Theme, Props>((theme) => ({
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

/** Props */
interface Props {
  group: Group;
}

/** Component */
export const GroupBlockGrid = (props: Props) => {
  const { group } = props;
  const classes = useStyles(props);

  return (
    <div className={classes.grid}>
      {renderGroupJoinCard()}
      {renderRoomCards()}
    </div>
  );

  // TODO: adapt to new data model
  function renderGroupJoinCard() {
    if (!group.groupJoinConfig) {
      return;
    } else {
      const groupConvertedToLegacy: GroupLegacy = {
        id: group.name, // TODO: other id? ->
        name: group.name,
        description: group.description,
        disabledAfter: "",
        disabledBefore: "",
        joinableAfter: "",
        groupJoin: group.groupJoinConfig,
      };
      return renderGridCard(
        `group-join-${group.name}`,
        <GroupJoinCard group={groupConvertedToLegacy} isJoinable={true} isListMode={false} fillHeight={true} />
      );
    }
  }

  // TODO: adapt to new data model
  function renderRoomCards() {
    const shownRooms = selectShownRooms();
    return shownRooms.map((room: Room) => {
      const roomConvertedToLegacy: RoomLegacy = {
        name: room.name,
        roomId: room.meeting.meetingId,
        meetingId: room.meeting.meetingId,
        subtitle: room.subtitle,
        description: room.description,
        joinUrl: room.joinUrl,
        titleUrl: room.titleUrl,
        temporary: false,
        links: room.roomLinks,
        groupId: group.name,
        icon: room.icon,
        slackNotification: room.slackNotification,
      };
      return renderGridCard(
        room.meeting.meetingId,
        <RoomCard
          room={roomConvertedToLegacy}
          participants={room.meeting.participants}
          isDisabled={false}
          isJoinable={true}
          isListMode={false}
          fillHeight={true}
        />
      );
    });
  }

  function selectShownRooms() {
    if (!group.groupJoinConfig) {
      return group.rooms;
    } else {
      const [emptyRooms, filledRooms] = partition(group.rooms, (room) => room.meeting.participants.length === 0);
      return [...filledRooms, ...emptyRooms.slice(0, 1)];
    }
  }

  // TODO: outsource?
  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }
};
