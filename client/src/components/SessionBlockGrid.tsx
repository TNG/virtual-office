import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import RoomCard from "./RoomCard";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { RoomSession } from "../../../server/express/types/Session";
import { sessionIsActive } from "../sessionTimeProps";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { browserTimeZone, parseTime, printHoursMinutes } from "../time";
import { gql, useQuery } from "@apollo/client";
import { BLOCK_FRAGMENT_SHORT } from "../apollo/gqlQueries";

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

/** GraphQL Data */
const GET_BLOCK = gql`
  query getBlock($id: ID!) {
    getBlock(id: $id) {
      ...BlockFragmentShort
    }
  }
  ${BLOCK_FRAGMENT_SHORT}
`;

/** Props */
interface Props {
  id: string;
  isListMode: boolean;
  clientConfig: ClientConfig;
  meetings: MeetingsIndexed;
}

/** Component */
export const SessionBlockGrid = (props: Props) => {
  const { id, isListMode, meetings, clientConfig } = props;
  const { data, loading, error } = useQuery(GET_BLOCK, { variables: { id } });
  const classes = useStyles(props);

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
    return data.getBlock.sessions.map((session: any) => {
      const formattedStart = printHoursMinutes(parseTime(session.start, clientConfig?.timezone));
      const formattedEnd = printHoursMinutes(parseTime(session.end, clientConfig?.timezone));
      const timezone = browserTimeZone();
      const timeString = `${formattedStart}-${formattedEnd}${clientConfig?.timezone ? ` ${timezone}` : ""}`;

      const participants = participantsInMeeting(session.room.meetingId);

      return renderGridCard(
        session.id,
        <RoomCard
          id={session.room.id}
          timeStringForDescription={timeString}
          isActive={sessionIsActive(session, clientConfig)}
          isListMode={isListMode}
          fillHeight={true}
          meetings={meetings}
        />
      );
    });
  }

  function participantsInMeeting(meetingId: string | undefined): MeetingParticipant[] {
    if (meetingId && meetings[meetingId]) {
      return meetings[meetingId].participants;
    }
    return [];
  }

  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }
};
