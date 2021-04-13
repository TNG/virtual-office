import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Group } from "../../../server/express/types/Group";
import GroupIcon from "@material-ui/icons/QueuePlayNext";
import { GroupJoinConfig } from "../../../server/express/types/GroupLegacy";
import { gql, useQuery } from "@apollo/client";
import { GROUP_JOIN_CONFIG_FRAGMENT_COMPLETE } from "../apollo/gqlQueries";

/** Styles */
const useStyles = makeStyles<Theme, Props>((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 12,
    boxSizing: "border-box",
    height: (props) => (props.fillHeight ? "100%" : undefined),
    opacity: (props) => (props.isActive ? 1 : 0.65),
    backgroundColor: theme.palette.secondary.light,
  },
  header: {
    flex: "0 0 auto",
    padding: 0,
    minHeight: 40,
    alignItems: "flex-start",
  },
  content: {
    flex: "0 1 100%",
    padding: "4px 8px 0 8px",
    display: "flex",
    alignItems: "stretch",
    flexDirection: "column-reverse",
    justifyContent: (props) => (props.isListMode ? "space-between" : "flex-end"),
    "&:last-child": {
      padding: "0 8px",
    },

    [theme.breakpoints.up("sm")]: {
      alignItems: (props) => (props.isListMode ? "center" : "stretch"),
      flexDirection: (props) => (props.isListMode ? "row" : "column-reverse"),
    },
  },
  actions: {
    height: 44,
    padding: 0,
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
  button: {
    margin: "12px 4px 0",
  },
}));

/** GraphQL Data */
const GET_GROUP_JOIN_CONFIG = gql`
  query getGroupJoinConfig($id: ID!) {
    getGroupJoinConfig(id: $id) {
      ...GroupJoinConfigFragmentComplete
    }
  }
  ${GROUP_JOIN_CONFIG_FRAGMENT_COMPLETE}
`;

/** Props */
interface Props {
  id: string;
  groupName: string;
  isActive: boolean;
  isListMode: boolean;
  fillHeight?: boolean;
}

/** Component */
const GroupJoinCard = (props: Props) => {
  const { id, groupName, isActive } = props;
  const classes = useStyles(props);

  const { data, loading, error } = useQuery(GET_GROUP_JOIN_CONFIG, { variables: { id } });

  if (!data) return null;

  function renderJoinUrl() {
    const href = `/api/groups/${groupName}/join`;
    return (
      isActive && (
        <Button
          className={classes.button}
          size="small"
          color="secondary"
          variant="contained"
          href={href}
          target="_blank"
        >
          Join Random
        </Button>
      )
    );
  }

  return (
    <Card className={classes.root} key={groupName}>
      <CardHeader
        className={classes.header}
        avatar={<GroupIcon color="action" fontSize="large" />}
        title={<Typography variant="h5">{data.getGroupJoinConfig.title}</Typography>}
        subheader={<Typography variant="body2">{data.getGroupJoinConfig.subtitle}</Typography>}
      />

      <CardContent className={classes.content}>
        <Typography variant="body2">{data.getGroupJoinConfig.description}</Typography>
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};

export default GroupJoinCard;
