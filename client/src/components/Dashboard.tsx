import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { groupBy, mapValues, sortBy } from "lodash";

import {
  RoomEvent,
  RoomEventType,
  ParticipantEvent,
  ParticipantEventType,
} from "../../../server/express/types/RoomEvent";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import { SocketContext } from "../socket/Context";
import { search } from "../search";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./LoginBackground.jpg";
import RoomGrid from "./RoomGrid";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  background: {
    height: "100vh",
    backgroundImage: `url(${Background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(8px)",
    "-webkit-filter": "blur(8px)",
    opacity: 0.8,
  },
  content: {
    position: "fixed",
    height: "100vh",
    width: "100vw",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflowY: "auto",
  },
  rooms: {
    marginTop: 12,
    paddingTop: 56,
    [theme.breakpoints.up("sm")]: {
      paddingTop: 64,
    },
    padding: 12,
  },
}));

function reduceParticipantEvent(room: RoomWithParticipants, event: ParticipantEvent) {
  if (room.id !== event.payload.roomId) {
    return room;
  }

  switch (event.type) {
    case ParticipantEventType.Join:
      return { ...room, participants: [...room.participants, event.payload.participant] };
    case ParticipantEventType.Leave:
      return {
        ...room,
        participants: room.participants.filter(({ id }) => id !== event.payload.participant.id),
      };
    case ParticipantEventType.Update:
      return {
        ...room,
        participants: room.participants
          .filter(({ id }) => id !== event.payload.participant.id)
          .concat([event.payload.participant]),
      };
    default:
      return room;
  }
}

function reduceRoomOrParticipantEvent(
  rooms: RoomWithParticipants[],
  event: RoomEvent | ParticipantEvent
): RoomWithParticipants[] {
  switch (event.type) {
    case RoomEventType.Replace:
      return event.payload;
    case ParticipantEventType.Join:
    case ParticipantEventType.Leave:
    case ParticipantEventType.Update:
      return rooms.map((room) => reduceParticipantEvent(room, event));
    default:
      return rooms;
  }
}

const Dashboard = () => {
  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    axios.get("/api/me").catch(() => history.push("/login"));
  }, [history]);

  const context = useContext(SocketContext);
  const [rooms, setRooms] = useState([] as RoomWithParticipants[]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    const subscription = stateUpdate.subscribe((event: RoomEvent | ParticipantEvent) => {
      setRooms((prevRooms) => reduceRoomOrParticipantEvent(prevRooms, event));
    });

    return () => {
      subscription.unsubscribe();
      context.disconnect();
    };
  }, [context]);

  const searchResult = search(searchText, rooms);
  const groups = groupBy(searchResult, (room) => room.group || "");
  const groupsWithSortedRooms = mapValues(groups, (rooms) => sortBy(rooms, (room) => room.name));
  const sortedGroups = sortBy(Object.entries(groupsWithSortedRooms), ([group, _]) => group);

  return (
    <Box>
      <Box className={classes.background} />
      <Box className={classes.content}>
        <AppBar onSearchTextChange={setSearchText} />

        <Box className={classes.rooms}>
          {sortedGroups.map(([group, rooms]) => (
            <RoomGrid key={group} group={group} rooms={rooms} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
