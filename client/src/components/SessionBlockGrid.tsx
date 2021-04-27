import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import RoomCard from "./RoomCard";
import { sessionIsActive, sessionHasEnded } from "../sessionTimeProps";
import { browserTimeZone, parseTime, printHoursMinutes } from "../time";
import { useQuery } from "@apollo/client";
import { GET_BLOCK_SHORT, GET_CLIENT_CONFIG_COMPLETE } from "../apollo/gqlQueries";
import { ClientConfig } from "../../../server/types/ClientConfig";

/** Styles */
const useStyles = makeStyles<Theme, Props>((theme) => ({
  grid: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  card: {
    width: "100%",
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "33.33%",
    },
    [theme.breakpoints.up("lg")]: {
      width: "33.33%",
    },
    [theme.breakpoints.up("xl")]: {
      width: "25%",
    },
  },
  cardGroupHeader: {
    padding: 8,
  },
  groupHeaderCard: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
    },
  },
  groupHeaderCardHeader: {
    flex: "0 0 auto",
    minHeight: 40,
  },
  groupHeaderCardContent: {
    display: "flex",
    flex: "1 1 auto",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    flexGrow: 1,
  },
}));

/** Props */
interface Props {
  id: string;
}

/** Component */
export const SessionBlockGrid = (props: Props) => {
  const { id } = props;
  const classes = useStyles(props);

  const { data: blockData, loading: blockLoading, error: blockError } = useQuery(GET_BLOCK_SHORT, {
    variables: { id },
  });
  const { data: clientConfigData, loading: clientConfigLoading, error: clientConfigError } = useQuery<{
    getClientConfig: ClientConfig;
  }>(GET_CLIENT_CONFIG_COMPLETE);

  if (!blockData) {
    return null;
  }

  return (
    <div className={classes.root}>
      {renderGroupHeader()}
      <div className={classes.grid}>{renderRoomCards()}</div>
    </div>
  );

  function renderGroupHeader() {
    const descriptionConfigured = blockData.getBlock.description && (
      <CardContent className={classes.groupHeaderCardContent}>
        <Typography variant="body2">{blockData.getBlock.description}</Typography>
      </CardContent>
    );

    return (
      <div className={`${classes.cardGroupHeader}`}>
        <Card className={classes.groupHeaderCard}>
          <CardHeader
            className={classes.groupHeaderCardHeader}
            title={<Typography variant="h5">{blockData.getBlock.title}</Typography>}
          />
          {descriptionConfigured}
          <CardActions />
        </Card>
      </div>
    );
  }

  function renderRoomCards() {
    if (!clientConfigData) return null;

    return blockData.getBlock.sessions.map((session: any) => {
      const formattedStart = printHoursMinutes(parseTime(session.start, clientConfigData.getClientConfig.timezone));
      const formattedEnd = printHoursMinutes(parseTime(session.end, clientConfigData.getClientConfig.timezone));
      const timezone = browserTimeZone();
      const timeString = `${formattedStart}-${formattedEnd}${
        clientConfigData.getClientConfig.timezone ? ` ${timezone}` : ""
      }`;

      const hideSession: boolean = clientConfigData.getClientConfig.hideEndedSessions
        ? clientConfigData.getClientConfig.hideEndedSessions &&
          sessionHasEnded(session, clientConfigData.getClientConfig)
        : false;

      return (
        !hideSession &&
        session.isInSearch &&
        renderGridCard(
          session.id,
          <RoomCard
            id={session.room.id}
            timeStringForDescription={timeString}
            isActive={sessionIsActive(session, clientConfigData.getClientConfig)}
            fillHeight={true}
          />
        )
      );
    });
  }

  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }
};
