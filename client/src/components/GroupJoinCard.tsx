import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import GroupIcon from "@material-ui/icons/QueuePlayNext";
import { useQuery } from "@apollo/client";
import { GET_CLIENT_CONFIG_COMPLETE, GET_GROUP_JOIN_CONFIG_COMPLETE } from "../apollo/gqlQueries";
import { defaultClientConfig } from "../contexts/ClientConfigContext";
import { ClientConfigApollo } from "../../../server/apollo/TypesApollo";

/** Styles */
interface StyleProps {
  clientConfig: ClientConfigApollo;
  props: Props;
}
const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 12,
    boxSizing: "border-box",
    height: (props) => (props.props.fillHeight ? "100%" : undefined),
    opacity: (props) => (props.props.isActive ? 1 : 0.65),
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
    justifyContent: (props) => (props.clientConfig.viewMode === "list" ? "space-between" : "flex-end"),
    "&:last-child": {
      padding: "0 8px",
    },

    [theme.breakpoints.up("sm")]: {
      alignItems: (props) => (props.clientConfig.viewMode === "list" ? "center" : "stretch"),
      flexDirection: (props) => (props.clientConfig.viewMode === "list" ? "row" : "column-reverse"),
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

/** Props */
interface Props {
  id: string;
  groupName: string;
  isActive: boolean;
  fillHeight?: boolean;
}

/** Component */
const GroupJoinCard = (props: Props) => {
  const { id, groupName, isActive } = props;

  const {
    data: groupJoinData,
    loading: groupJoinLoading,
    error: groupJoinError,
  } = useQuery(GET_GROUP_JOIN_CONFIG_COMPLETE, { variables: { id } });
  const { data: clientConfigData, loading: clientConfigLoading, error: clientConfigError } = useQuery<{
    getClientConfig: ClientConfigApollo;
  }>(GET_CLIENT_CONFIG_COMPLETE);

  const classes = useStyles({
    clientConfig: clientConfigData ? clientConfigData.getClientConfig : defaultClientConfig,
    props: props,
  });

  if (!groupJoinData) return null;

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
        title={<Typography variant="h5">{groupJoinData.getGroupJoinConfig.title}</Typography>}
        subheader={<Typography variant="body2">{groupJoinData.getGroupJoinConfig.subtitle}</Typography>}
      />

      <CardContent className={classes.content}>
        <Typography variant="body2">{groupJoinData.getGroupJoinConfig.description}</Typography>
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};

export default GroupJoinCard;
