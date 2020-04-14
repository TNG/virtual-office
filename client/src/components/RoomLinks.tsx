import React from "react";

import { Box, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomLink } from "../types/RoomLink";
import { sortBy } from "lodash";

const useStyles = makeStyles({
  root: {
    marginTop: 20,
  },
  link: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
});

const RoomLinks = ({ links }: { links: RoomLink[] | undefined }) => {
  const classes = useStyles();

  if (!links || links.length <= 0) {
    return null;
  }

  const sortedLinks = sortBy(links, (link) => link.text);

  return (
    <Box className={classes.root}>
      {sortedLinks.map((link) => (
        <Link key={link.text} className={classes.link} href={link.href} target="_blank">
          <img className={classes.icon} src={link.icon} alt={link.text} />
          <Typography variant="body2">{link.text}</Typography>
        </Link>
      ))}
    </Box>
  );
};

export default RoomLinks;
