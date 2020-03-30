import { makeStyles } from "@material-ui/styles";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { RoomEvent } from "../../../server/express/types/RoomEvent";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import { SocketContext } from "../socket/Context";
import Background from "./LoginBackground.jpg";
import RoomGrid from "./RoomGrid";

const useStyles = makeStyles({
  background: {
    height: "100vh",
    backgroundImage: `url(${Background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(8px)",
    "-webkit-filter": "blur(8px)",
  },
  content: {
    position: "absolute",
    height: "100vh",
    width: "100vw",

    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
});

const Dashboard = () => {
  const classes = useStyles();

  let history = useHistory();

  const context = useContext(SocketContext);
  const [rooms, setRooms] = useState([] as RoomWithParticipants[]);

  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    stateUpdate.subscribe((incomingMessage: RoomEvent) => {
      console.log(`Notify: ${JSON.stringify(incomingMessage)}`);
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
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
  }, [context]);

  useEffect(() => {
    axios
      .get("/api/rooms")
      .then(({ data }) => setRooms(data))
      .catch(() => history.push("/login"));
  }, [history]);

  return (
    <div>
      <div className={classes.background} />
      <div className={classes.content}>
        <RoomGrid rooms={rooms} />
      </div>
    </div>
  );
};

export default Dashboard;
