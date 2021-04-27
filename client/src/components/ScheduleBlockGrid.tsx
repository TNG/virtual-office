import React from "react";
import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { browserTimeZone, parseTime, printHoursMinutes } from "../time";
import { DateTime } from "luxon";
import RoomCard from "./RoomCard";
import { GroupBlockGrid } from "./GroupBlockGrid";
import { sessionHasEnded, sessionIsActive } from "../sessionTimeProps";
import { useQuery } from "@apollo/client";
import { GET_BLOCK_SHORT, GET_CLIENT_CONFIG_COMPLETE } from "../apollo/gqlQueries";
import { Track } from "../../../server/types/Block";
import { ClientConfig } from "../../../server/types/ClientConfig";
import { defaultClientConfig } from "../DefaultClientConfig";

/** Styles */
interface StyleProps {
  clientConfig: ClientConfig;
  data: {
    getBlock: {
      tracks: Track[];
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
    .map((session: any) => DateTime.fromFormat(session.start, "HH:mm", { zone: clientConfig.timezone }))
    .sort()
    .shift();
  const latestEnd = sessions
    .map((session: any) => DateTime.fromFormat(session.end, "HH:mm", { zone: clientConfig.timezone }))
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

/** Props */
interface Props {
  id: string;
}

/** Component */
export const ScheduleBlockGrid = (props: Props) => {
  const { id } = props;

  const { data: blockData, loading: blockLoading, error: blockError } = useQuery(GET_BLOCK_SHORT, {
    variables: { id },
  });
  const { data: clientConfigData, loading: clientConfigLoading, error: clientConfigError } = useQuery<{
    getClientConfig: ClientConfig;
  }>(GET_CLIENT_CONFIG_COMPLETE);

  const classes = useStyles({
    clientConfig: clientConfigData ? clientConfigData.getClientConfig : defaultClientConfig,
    data: blockData,
  });

  if (!(blockData && clientConfigData)) {
    return null;
  }

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
        {blockData.getBlock.tracks.map((track: Track) => {
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
    return blockData.getBlock.sessions.map((session: any) => {
      const tracksOfSession: [string, string?] = session.trackName
        ? [session.trackName]
        : [blockData.getBlock.tracks[0].name, blockData.getBlock.tracks[blockData.getBlock.tracks.length - 1].name];

      if (!clientConfigData) return null;

      const hideSession: boolean = clientConfigData.getClientConfig.hideEndedSessions
        ? clientConfigData.getClientConfig.hideEndedSessions &&
          sessionHasEnded(session, clientConfigData.getClientConfig)
        : false;

      const formattedStart = printHoursMinutes(parseTime(session.start, clientConfigData.getClientConfig.timezone));
      const formattedEnd = printHoursMinutes(parseTime(session.end, clientConfigData.getClientConfig.timezone));
      const timezone = browserTimeZone();
      const timeString = `${formattedStart}-${formattedEnd}${
        clientConfigData.getClientConfig.timezone ? ` ${timezone}` : ""
      }`;

      if (session.type === "ROOM_SESSION") {
        return (
          !hideSession &&
          session.isInSearch &&
          renderGridCard(
            session.id,
            classes.card,
            session.start,
            session.end,
            tracksOfSession,
            <RoomCard
              id={session.room.id}
              timeStringForDescription={timeString}
              isActive={sessionIsActive(session, clientConfigData.getClientConfig)}
              fillHeight={true}
            />
          )
        );
      } else if (session.type === "GROUP_SESSION") {
        return (
          !hideSession &&
          session.isInSearch &&
          renderGridCard(
            session.id,
            classes.groupCard,
            session.start,
            session.end,
            tracksOfSession,
            <GroupBlockGrid
              id={session.group.id}
              timeStringForDescription={timeString}
              isActive={sessionIsActive(session, clientConfigData.getClientConfig)}
            />
          )
        );
      }
    });
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
