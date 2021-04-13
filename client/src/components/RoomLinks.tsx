import React from "react";

import { Link, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import LinkIcon from "@material-ui/icons/Link";
import { RoomLinkApollo } from "../../../server/apollo/TypesApollo";
import { gql, useQuery } from "@apollo/client";
import { ROOM_LINK_FRAGMENT_COMPLETE } from "../apollo/gqlQueries";

/** Styles */
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
});

/** GraphQL Data */
const GET_ROOM_LINKS = gql`
  query getRoomLinks($ids: [ID!]!) {
    getRoomLinks(ids: $ids) {
      ...RoomLinkFragmentComplete
    }
  }
  ${ROOM_LINK_FRAGMENT_COMPLETE}
`;

/** Props */
interface Props {
  ids: string[] | undefined;
  isListMode: boolean;
}

interface Data {
  getRoomLinks: RoomLinkApollo[];
}

/** Component */
const RoomLinks = (props: Props) => {
  const classes = useStyles(props);
  const { ids } = props;

  const { data, loading, error } = useQuery<Data>(GET_ROOM_LINKS, { variables: { ids } });

  if (!data || data.getRoomLinks.length <= 0) return null;

  const groupedLinks = data.getRoomLinks.reduce((acc, link: RoomLinkApollo) => {
    const group = link.linkGroup || "";
    acc[group] = [...(acc[group] || []), link];
    return acc;
  }, {} as { [group: string]: RoomLinkApollo[] });

  return (
    <div className={classes.root}>
      {Object.entries(groupedLinks).map(([group, groupLinks]) => (
        <div className={classes.group} key={group}>
          <Typography variant="subtitle2">{group}</Typography>
          <div className={classes.linkGroup}>
            {groupLinks.map((link: RoomLinkApollo, index: number) => (
              <Link key={link.text + index} className={classes.link} href={link.href} target="_blank">
                {link.icon ? (
                  <img className={classes.icon} src={link.icon} alt={link.text} />
                ) : (
                  <LinkIcon className={classes.icon} />
                )}
                <Typography className={classes.linkText} variant="body2">
                  {link.text}
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
