import React from "react";

import { Box, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomLink } from "../../../server/express/types/RoomLink";

const useStyles = makeStyles({
  link: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 8,
  },
  linkGroup: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingLeft: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
  hidden: {
    opacity: 0.4,
  },
});

const RoomLinks = ({ links, isHidden }: { links: RoomLink[] | undefined; isHidden: boolean }) => {
  const classes = useStyles();

  if (!links || links.length <= 0) {
    return null;
  }

  const groupedLinks = links.reduce((acc, link) => {
    const group = link.group || "";
    acc[group] = [...(acc[group] || []), link];
    return acc;
  }, {} as { [group: string]: RoomLink[] });

  return (
    <Box>
      {Object.entries(groupedLinks).map(([group, groupLinks]) => (
        <Box key={group}>
          <Typography variant="subtitle2" className={isHidden ? classes.hidden : ""}>
            {group}
          </Typography>
          <Box className={classes.linkGroup}>
            {groupLinks.map((link) => (
              <Link key={link.text} className={classes.link} href={link.href} target="_blank">
                {link.icon ? (
                  <img
                    className={`${classes.icon} ${isHidden ? classes.hidden : ""}`}
                    src={link.icon}
                    alt={link.text}
                  />
                ) : (
                  <span className={classes.icon} />
                )}
                <Typography variant="body2" className={isHidden ? classes.hidden : ""}>
                  {link.text}
                </Typography>
              </Link>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default RoomLinks;
