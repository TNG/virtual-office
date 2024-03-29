import React from "react";

import { Link, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomLink } from "../../../server/express/types/RoomLink";
import LinkIcon from "@material-ui/icons/Link";

const useStyles = makeStyles<Theme, Props>({
  root: {
    width: "100%",
  },
  group: {
    width: "100%",
  },
  link: {
    flex: "0 1 auto",
    maxWidth: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingRight: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  linkGroup: {
    position: "relative",
    paddingTop: 4,
    paddingBottom: 4,
    display: "flex",
    flexDirection: (props) => (props.isListMode ? "row" : "column"),
    alignItems: (props) => (props.isListMode ? "center" : "stretch"),
    flexWrap: "wrap",
  },
  linkText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
  iconBig: {
    width: 48,
    height: 48,
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
    <div className={classes.root}>
      {Object.entries(groupedLinks).map(([group, groupLinks]) => (
        <div className={classes.group} key={group}>
          <Typography variant="subtitle2">{group}</Typography>
          <div className={classes.linkGroup}>
            {groupLinks.map((link, index) => (
              <Link key={link.text + index} className={classes.link} href={link.href} target="_blank">
                {link.iconBig ? (
                  <img className={classes.iconBig} src={link.iconBig} alt={link.text} />
                ) : link.icon ? (
                  <img className={classes.icon} src={link.icon} alt={link.text} />
                ) : (
                  <LinkIcon className={classes.icon} />
                )}
                <Typography className={classes.linkText} variant="body2">
                  {link.text}
                  {link.iconBig ? <br /> : ""}
                </Typography>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomLinks;
