import React from "react";
import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { browserTimeZone, parseTime, printHoursMinutes } from "../time";
import { DateTime } from "luxon";
import { Session } from "../../../server/express/types/Session";
import { Track } from "../../../server/express/types/Office";
import RoomCard from "./RoomCard";
import { GroupBlockGrid } from "./GroupBlockGrid";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { sessionIsActive } from "../sessionTimeProps";
import { gql, useQuery } from "@apollo/client";
import { BLOCK_FRAGMENT_SHORT } from "../apollo/gqlQueries";
import { TrackApollo } from "../../../server/apollo/TypesApollo";

/** Styles */
interface StyleProps {
  clientConfig: ClientConfig;
  data: {
    getBlock: {
      tracks: TrackApollo[];
      sessions: {
        id: string;
        start: string;
        end: string;
      }[];
    };
  };
}

const calculateGridTemplateRows = ({
  clientConfig,
  data: {
    getBlock: { sessions },
  },
}: StyleProps) => {
  const earliestStart = sessions
    .map((session: any) => DateTime.fromFormat(session.start, "HH:mm", { zone: clientConfig?.timezone }))
    .sort()
    .shift();
  const latestEnd = sessions
    .map((session: any) => DateTime.fromFormat(session.end, "HH:mm", { zone: clientConfig?.timezone }))
    .sort()
    .pop();
  let result = `[trackHeader] auto `;
  if (earliestStart && latestEnd) {
    for (let hour = earliestStart.hour; hour <= latestEnd.hour; hour++) {
      const paddedHour = String(hour).padStart(2, "0");
      result += `[time-${paddedHour}00] auto [time-${paddedHour}15] auto [time-${paddedHour}30] auto [time-${paddedHour}45] auto `;
    }
  }
  return result;
};

interface GridColumnDefinition {
  value: string;
  prevTrack: Track | undefined;
}

const calculateGridTemplateColumns = ({
  data: {
    getBlock: { tracks },
  },
}: StyleProps) => {
  const result = tracks.reduce<GridColumnDefinition>(
    ({ value, prevTrack }, val) => ({
      value: value + `[${prevTrack ? `track-${prevTrack.name}-end ` : ""}track-${val.name}-start] minmax(0, 1fr)`,
      prevTrack: val,
    }),
    { value: "", prevTrack: undefined }
  );
  const lastTrack = tracks[tracks.length - 1];
  return result.value + `[track-${lastTrack.name}-end]`;
};

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  schedule: {
    [theme.breakpoints.up("md")]: {
      display: "grid",
      gridGap: "1em",
      gridTemplateRows: calculateGridTemplateRows,
      gridTemplateColumns: calculateGridTemplateColumns,
    },
  },
  trackHeader: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "block",
      padding: 8,
      boxSizing: "border-box",
      textAlign: "center",
      color: "#fff",
      fontSize: 20,
    },
  },
  card: {
    padding: 8,
    boxSizing: "border-box",
  },
  groupCard: {
    padding: 0,
    boxSizing: "border-box",
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
  clientConfig: ClientConfig;
  meetings: MeetingsIndexed;
}

/** Component */
export const ScheduleBlockGrid = (props: Props) => {
  const { id, clientConfig, meetings } = props;
  const { data, loading, error } = useQuery(GET_BLOCK, { variables: { id } });

  if (!data) return null;

  const classes = useStyles({ clientConfig, data });

  return (
    <div className={classes.root}>
      <div className={classes.schedule}>
        {renderTrackHeader()}
        {renderSchedule()}
      </div>
    </div>
  );

  function renderTrackHeader() {
    return (
      <>
        {data.getBlock.tracks.map((track: TrackApollo) => {
          return (
            <div
              key={`track-${track.name}`}
              className={classes.trackHeader}
              style={{ gridRow: `trackHeader`, gridColumn: `track-${track.name}` }}
            >
              {track.name}
            </div>
          );
        })}
      </>
    );
  }

  function renderSchedule() {
    return data.getBlock.sessions.map((session: any) => {
      const tracksOfSession: [string, string?] = session.trackName
        ? [session.trackName]
        : [data.getBlock.tracks[0].name, data.getBlock.tracks[data.getBlock.tracks.length - 1].name];

      const isActive = sessionIsActive(session, clientConfig);

      const formattedStart = printHoursMinutes(parseTime(session.start, clientConfig?.timezone));
      const formattedEnd = printHoursMinutes(parseTime(session.end, clientConfig?.timezone));
      const timezone = browserTimeZone();
      const timeString = `${formattedStart}-${formattedEnd}${clientConfig?.timezone ? ` ${timezone}` : ""}`;

      if (session.type === "ROOM_SESSION") {
        const participants = participantsInMeeting(session.room.meetingId);

        return renderGridCard(
          session.id,
          classes.card,
          session.start,
          session.end,
          tracksOfSession,
          <RoomCard
            id={session.room.id}
            timeStringForDescription={timeString}
            isActive={isActive}
            isListMode={clientConfig.viewMode === "list"}
            fillHeight={true}
            meetings={meetings}
          />
        );
      } else if (session.type === "GROUP_SESSION") {
        return renderGridCard(
          session.id,
          classes.groupCard,
          session.start,
          session.end,
          tracksOfSession,
          <GroupBlockGrid
            id={session.group.id}
            timeStringForDescription={timeString}
            isActive={isActive}
            isListMode={clientConfig.viewMode === "list"}
            meetings={meetings}
          />
        );
      }
    });
  }

  function participantsInMeeting(meetingId: string | undefined): MeetingParticipant[] {
    if (meetingId && meetings[meetingId]) {
      return meetings[meetingId].participants;
    }
    return [];
  }

  function renderGridCard(
    key: string,
    className: any,
    start: string,
    end: string,
    [trackStart, trackEnd]: [string, string?],
    card: any
  ) {
    const gridRowStart = `time-${start.replace(":", "")}`;
    const gridRowEnd = `time-${end.replace(":", "")}`;
    const gridColumn = trackEnd ? `track-${trackStart}-start / track-${trackEnd}-end` : `track-${trackStart}`;
    return (
      <div key={key} className={className} style={{ gridRow: `${gridRowStart} / ${gridRowEnd}`, gridColumn }}>
        {card}
      </div>
    );
  }
};
