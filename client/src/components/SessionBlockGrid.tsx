import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import RoomCard from "./RoomCard";
import { sessionIsActive } from "../sessionTimeProps";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { browserTimeZone, parseTime, printHoursMinutes } from "../time";
import { useQuery } from "@apollo/client";
import { GET_BLOCK_SHORT } from "../apollo/gqlQueries";
import { SearchContext } from "../socket/Context";
import { sessionMatchesSearch } from "../search";

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
  isListMode: boolean;
  clientConfig: ClientConfig;
}

/** Component */
export const SessionBlockGrid = (props: Props) => {
  const { id, isListMode, clientConfig } = props;
  const { data, loading, error } = useQuery(GET_BLOCK_SHORT, { variables: { id } });
  const classes = useStyles(props);

  const searchText = useContext(SearchContext);
  const [sessionsToRender, setSessionsToRender] = useState<any[]>([]);
  useEffect(() => {
    if (data) {
      (async function setIds() {
        const sessionsMatch: boolean[] = await Promise.all(
          data.getBlock.sessions.map((session: any) => sessionMatchesSearch(session.id, searchText))
        );
        const sessionsMatching: any[] = [];
        sessionsMatch.forEach((matches, index) => {
          if (matches) {
            sessionsMatching.push(data.getBlock.sessions[index]);
          }
        });
        setSessionsToRender(sessionsMatching);
      })();
    }
  }, [searchText, data]);

  return (
    <div className={classes.root}>
      {renderGroupHeader()}
      <div className={classes.grid}>{renderRoomCards()}</div>
    </div>
  );

  function renderGroupHeader() {
    const descriptionConfigured = data.getBlock.description && (
      <CardContent className={classes.groupHeaderCardContent}>
        <Typography variant="body2">{data.getBlock.description}</Typography>
      </CardContent>
    );

    return (
      <div className={`${classes.cardGroupHeader}`}>
        <Card className={classes.groupHeaderCard}>
          <CardHeader
            className={classes.groupHeaderCardHeader}
            title={<Typography variant="h5">{data.getBlock.title}</Typography>}
          />
          {descriptionConfigured}
          <CardActions />
        </Card>
      </div>
    );
  }

  function renderRoomCards() {
    return sessionsToRender.map((session: any) => {
      const formattedStart = printHoursMinutes(parseTime(session.start, clientConfig?.timezone));
      const formattedEnd = printHoursMinutes(parseTime(session.end, clientConfig?.timezone));
      const timezone = browserTimeZone();
      const timeString = `${formattedStart}-${formattedEnd}${clientConfig?.timezone ? ` ${timezone}` : ""}`;

      return renderGridCard(
        session.id,
        <RoomCard
          id={session.room.id}
          timeStringForDescription={timeString}
          isActive={sessionIsActive(session, clientConfig)}
          isListMode={isListMode}
          fillHeight={true}
        />
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