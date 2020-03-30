import React from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import RoomCard from "./RoomCard";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";

const useStyles = makeStyles({
  title: {
    margin: 12,
    marginTop: 16,
    marginBottom: 8,
    padding: 0,
  },
});

const RoomGrid = ({ group, rooms }: { group: string | undefined; rooms: RoomWithParticipants[] }) => {
  const classes = useStyles();

  return (
    <Box>
      {group && <h2 className={classes.title}>{group}</h2>}

      <Box display={"flex"} flexWrap={"wrap"}>
        {rooms.map((room) => (
          <Box key={room.id} p={2}>
            <RoomCard room={room} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RoomGrid;
