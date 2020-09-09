import React from "react";

import { Link, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomLink } from "../../../server/express/types/RoomLink";
import LinkIcon from "@material-ui/icons/Link";

const useStyles = makeStyles<Theme, Props>({
  root: {
    display: "flex",
    alignItems: "center",
  },
  link: {
    flex: "0 1 auto",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingRight: 12,
    marginTop: 4,
    marginBottom: 4,
    textOverflow: "ellipsis",
    whitespace: "no-wrap",
    overflow: "hidden",
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
    <div>
      {Object.entries(groupedLinks).map(([group, groupLinks]) => (
        <div key={group}>
          <Typography variant="subtitle2">{group}</Typography>
          <div className={classes.linkGroup}>
            {groupLinks.map((link, index) => (
              <Link key={link.text + index} className={classes.link} href={link.href} target="_blank">
                {link.icon ? (
                  <img className={classes.icon} src={link.icon} alt={link.text} />
                ) : (
                  <LinkIcon className={classes.icon} />
                )}
                <Typography variant="body2">{link.text}</Typography>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomLinks;
