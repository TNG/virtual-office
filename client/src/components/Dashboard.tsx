import { Box } from "@material-ui/core";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { RoomEvent } from "../../../server/express/types/RoomEvent";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import { SocketContext } from "../socket/Context";
import RoomGrid from "./RoomGrid";

const Dashboard = () => {
  let history = useHistory();

  const context = useContext(SocketContext);
  const [rooms, setRooms] = useState([] as RoomWithParticipants[]);

  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    stateUpdate.subscribe((incomingMessage: RoomEvent) => {
      console.log(`Notify: ${JSON.stringify(incomingMessage)}`);
      setRooms(
        rooms.map((room) => {
          if (room.id === incomingMessage.roomId) {
            if (incomingMessage.type === "join") {
              return { ...room, participants: [...room.participants, incomingMessage.participant] };
            } else if (incomingMessage.type === "leave") {
              return {
                ...room,
                participants: room.participants.filter(({ id }) => id !== incomingMessage.participant.id),
              };
            }
          }
          return room;
        })
      );
    });

    return () => context.disconnect();
  }, [context, rooms]); // TODO is rooms as dependency a good idea..?

  useEffect(() => {
    axios
      .get("/api/rooms")
      .then(({ data }) => setRooms(data))
      .catch(() => history.push("/login"));
  }, [history]);

  return (
    <Box>
      <h1>Dashboard</h1>
      <RoomGrid rooms={rooms} />
    </Box>
  );
};

export default Dashboard;
