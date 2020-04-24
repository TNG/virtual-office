import React from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { partition } from "lodash";

import { Group } from "../../../server/express/types/Group";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import GroupJoinCard from "./GroupJoinCard";
import RoomCard from "./RoomCard";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  title: {
    margin: 12,
    marginTop: 24,
    padding: 0,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  card: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "33%",
    },
    [theme.breakpoints.up("lg")]: {
      width: theme.breakpoints.width("lg") / 3,
    },
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
  },
}));

const RoomGrid = ({ group, rooms }: { group: Group; rooms: RoomWithParticipants[] }) => {
  const classes = useStyles();

  function renderGridCard(key: string, card: any) {
    return (
      <Box key={key} className={classes.card}>
        {card}
      </Box>
    );
  }

  function selectShownRooms() {
    if (!group.groupJoin) {
      return rooms;
    }

    const [emptyRooms, filledRooms] = partition(rooms, (room) => room.participants.length === 0);
    return [...filledRooms, ...emptyRooms.slice(0, 1)];
  }

  function renderRoomCards() {
    const shownRooms = selectShownRooms();
    return shownRooms.map((room) => renderGridCard(room.id, <RoomCard room={room} />));
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
