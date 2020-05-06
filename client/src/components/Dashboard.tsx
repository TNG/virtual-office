import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";

import { RoomEvent } from "../../../server/express/types/RoomEvent";
import { Office } from "../../../server/express/types/Office";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import { SocketContext } from "../socket/Context";
import { search } from "../search";

import Box from "@material-ui/core/Box/Box";
import RoomGrid from "./RoomGrid";
import theme from "../theme";
import { Group } from "../../../server/express/types/Group";
import { Header } from "./Header";

const useStyles = makeStyles<typeof theme>((theme) => ({
  background: {
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
  },
  content: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  rooms: {
    maxWidth: 1200,
    width: "100%",
    marginTop: 12,
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

const Dashboard = ({ location }: any) => {
  const classes = useStyles();

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
          .filter((room) => (room.groupId || undefinedGroup.id) === group.id)
          .map(shouldFocus(location));

        return {
          group,
          rooms,
        };
      })
      .filter((entry) => entry.rooms.length > 0);
  }

  const groupsWithRooms = selectGroupsWithRooms();
  return (
    <Box className={classes.background}>
      <Box className={classes.content}>
        <Header />
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

const shouldFocus = (location: Location) => (
  room: RoomWithParticipants
): RoomWithParticipants & { shouldFocus?: boolean } => {
  const params = new URLSearchParams(location.search);
  const talkId = params.get("talk");
  if (room.id === talkId) {
    return { ...room, shouldFocus: true };
  }
  return room;
};
