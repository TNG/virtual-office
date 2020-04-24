import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import { RoomEvent } from "../../../server/express/types/RoomEvent";
import { Office } from "../../../server/express/types/Office";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import { SocketContext } from "../socket/Context";
import { search } from "../search";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./LoginBackground.jpg";
import RoomGrid from "./RoomGrid";
import theme from "../theme";
import { Group } from "../../../server/express/types/Group";

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

const mapOfficeEventToOffice = (office: Office, roomEvent: RoomEvent): Office => {
  function applyRoomEventTo(room: RoomWithParticipants): RoomWithParticipants {
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
  }

  const newRooms = office.rooms.map((room) => (room.id === roomEvent.roomId ? applyRoomEventTo(room) : room));

  return {
    ...office,
    rooms: newRooms,
  };
};

const Dashboard = () => {
  const classes = useStyles();

  const history = useHistory();
  useEffect(() => {
    axios.get("/api/me").catch(() => history.push("/login"));
  }, [history]);

  const context = useContext(SocketContext);
  const [office, setOffice] = useState({ rooms: [], groups: [] } as Office);
  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    const subscription = stateUpdate.subscribe((incomingMessage: RoomEvent) => {
      setOffice((prevOffice) => mapOfficeEventToOffice(prevOffice, incomingMessage));
    });

    const officeSubscription = context.onOffice().subscribe((event) => setOffice(event));

    return () => {
      subscription.unsubscribe();
      context.disconnect();
      officeSubscription.unsubscribe();
    };
  }, [context]);

  const [searchText, setSearchText] = useState("");
  function selectGroupsWithRooms() {
    const searchResult = search(searchText, office);
    const undefinedGroup: Group = {
      id: "",
      name: "",
    };

    const groups = [undefinedGroup, ...searchResult.groups];
    return groups
      .map((group) => {
        const rooms = searchResult.rooms
          .filter((room) => (room.group || undefinedGroup.id) === group.id)
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          group,
          rooms,
        };
      })
      .filter((entry) => entry.rooms.length > 0)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));
  }

  const groupsWithRooms = selectGroupsWithRooms();
  return (
    <Box>
      <Box className={classes.background} />
      <Box className={classes.content}>
        <AppBar onSearchTextChange={setSearchText} />

        <Box className={classes.rooms}>
          {groupsWithRooms.map(({ group, rooms }) => (
            <RoomGrid key={group.id} group={group} rooms={rooms} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
