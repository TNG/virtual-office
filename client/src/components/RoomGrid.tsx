import { Box } from "@material-ui/core";
import React from "react";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import RoomCard from "./RoomCard";

const RoomGrid = ({ rooms }: { rooms: RoomWithParticipants[] }) => {
  return (
    <Box display={"flex"} flexWrap={"wrap"}>
      {rooms.map((room) => (
        <Box key={room.id} p={2}>
          <RoomCard room={room} />
        </Box>
      ))}
    </Box>
  );
};

export default RoomGrid;
