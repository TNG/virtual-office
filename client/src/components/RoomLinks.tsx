import React from "react";

import { Box, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomLink } from "../../../server/express/types/RoomLink";
import theme from "../theme";

const useStyles = makeStyles<typeof theme, Props>({
  link: {
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingRight: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  linkGroup: {
    paddingTop: 4,
    paddingBottom: 4,
    display: "flex",
    flexDirection: (props) => (props.isListMode ? "row" : "column"),
    alignItems: (props) => (props.isListMode ? "center" : "stretch"),
    flexWrap: "wrap",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
});

interface Props {
  links: RoomLink[] | undefined;
  isListMode: boolean;
}

const RoomLinks = (props: Props) => {
  const classes = useStyles(props);
  const { links } = props;

  if (!links || links.length <= 0) {
    return null;
  }

  const groupedLinks = links.reduce((acc, link) => {
    const group = link.group || "";
    acc[group] = [...(acc[group] || []), link];
    return acc;
  }, {} as { [group: string]: RoomLink[] });

  return (
    <Box display="flex" alignItems="center">
      {Object.entries(groupedLinks).map(([group, groupLinks]) => (
        <Box key={group}>
          <Typography variant="subtitle2">{group}</Typography>
          <Box className={classes.linkGroup}>
            {groupLinks.map((link) => (
              <Link key={link.text} className={classes.link} href={link.href} target="_blank">
                {link.icon && <img className={classes.icon} src={link.icon} alt={link.text} />}
                <Typography variant="body2">{link.text}</Typography>
              </Link>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default RoomLinks;
