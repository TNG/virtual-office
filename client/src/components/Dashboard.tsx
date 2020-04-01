import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { groupBy, mapValues, sortBy } from "lodash";

import { RoomEvent } from "../../../server/express/types/RoomEvent";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import { SocketContext } from "../socket/Context";
import Background from "./LoginBackground.jpg";
import RoomGrid from "./RoomGrid";
import AppBar from "./AppBar";
import Box from "@material-ui/core/Box/Box";
import theme from "../theme";
import { search } from "../search";

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
    marginTop: 56,
    [theme.breakpoints.up("sm")]: {
      marginTop: 64,
    },
    padding: 12,
  },
}));

const mapRoomEventToRoom = (room: RoomWithParticipants, roomEvent: RoomEvent): RoomWithParticipants => {
  if (room.id === roomEvent.roomId) {
    switch (roomEvent.type) {
      case "join":
        return { ...room, participants: [...room.participants, roomEvent.participant] };
      case "leave":
        return {
          ...room,
          participants: room.participants.filter(({ id }) => id !== roomEvent.participant.id),
        };
      case "update":
        return {
          ...room,
          participants: room.participants
            .filter(({ id }) => id !== roomEvent.participant.id)
            .concat([roomEvent.participant]),
        };
    }
  }
  return room;
};

const Dashboard = () => {
  const history = useHistory();
  const classes = useStyles();

  const context = useContext(SocketContext);
  const [rooms, setRooms] = useState([] as RoomWithParticipants[]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    const subscription = stateUpdate.subscribe((incomingMessage: RoomEvent) => {
      setRooms((prevRooms) => prevRooms.map((room) => mapRoomEventToRoom(room, incomingMessage)));
    });

    return () => {
      subscription.unsubscribe();
      context.disconnect();
    };
  }, [context]);

  useEffect(() => {
    axios
      .get("/api/rooms")
      .then(({ data }) => setRooms(data))
      .catch(() => history.push("/login"));
  }, [history]);

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
