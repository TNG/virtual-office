import React from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import RoomCard from "./RoomCard";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import theme from "../theme";
import { Group } from "../../../server/express/types/Group";

const useStyles = makeStyles<typeof theme>((theme) => ({
  title: {
    margin: 12,
    marginTop: 16,
    marginBottom: 8,
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

  return (
    <Box>
      {group.name && <h2 className={classes.title}>{group.name}</h2>}

      <Box className={classes.grid}>
        {rooms.map((room) => (
          <Box key={room.id} className={classes.card}>
            <RoomCard room={room} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RoomGrid;
