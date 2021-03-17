import React from "react";
import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { browserTimeZone, parseTime, printHoursMinutes } from "../time";
import RoomCard from "./RoomCard";
import { RoomLegacy } from "../../../server/express/types/RoomLegacy";
import { DateTime } from "luxon";
import { Session } from "../../../server/express/types/Session";
import { Track } from "../../../server/express/types/Office";
import RoomCardNew from "./RoomCardNew";

const calculateGridTemplateRows = ({ sessions, clientConfig }: Props) => {
  const earliestStart = sessions
    .map(({ start }) => DateTime.fromFormat(start, "HH:mm", { zone: clientConfig?.timezone }))
    .sort()
    .shift();
  const latestEnd = sessions
    .map(({ end }) => DateTime.fromFormat(end, "HH:mm", { zone: clientConfig?.timezone }))
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

const calculateGridTemplateColumns = ({ tracks }: Props) => {
  const result = tracks.reduce<GridColumnDefinition>(
    ({ value, prevTrack }, val) => ({
      value: value + `[${prevTrack ? `track-${prevTrack.name}-end ` : ""}track-${val.name}-start] 581px `, // TODO: replace by minmax(0, 1fr)
      prevTrack: val,
    }),
    { value: "", prevTrack: undefined }
  );
  const lastTrack = tracks[tracks.length - 1];
  return result.value + `[track-${lastTrack.name}-end]`;
};

const useStyles = makeStyles<Theme, Props>((theme) => ({
  title: {
    color: "#fff",
    margin: 12,
    marginTop: 24,
    padding: 0,
  },
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
  time: {
    color: "#fff",
    fontSize: 20,
  },
  card: {
    padding: 4,
    boxSizing: "border-box",
  },
}));

interface Props {
  tracks: Track[];
  sessions: Session[];
  clientConfig: ClientConfig;
}

export const ScheduleBlockGrid = (props: Props) => {
  const { tracks, sessions, clientConfig } = props;
  const classes = useStyles(props);

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
        {tracks.map((track: Track) => {
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

  // TODO: ID + new data format, isActive
  function renderSchedule() {
    return sessions.map((session: Session) => {
      const tracksOfSession: [string, string?] = session.trackName
        ? [session.trackName]
        : [tracks[0].name, tracks[tracks.length - 1].name];

      const isActive = sessionIsActive(session);

      if (session.type === "ROOM_SESSION") {
        const formattedStart = printHoursMinutes(parseTime(session.start, clientConfig?.timezone));
        const formattedEnd = printHoursMinutes(parseTime(session.end, clientConfig?.timezone));
        const timezone = browserTimeZone();
        const timeString = `${formattedStart}-${formattedEnd}${clientConfig?.timezone ? ` ${timezone}` : ""}`;
        const roomWithTime = {
          ...session.room,
          subtitle: `(${timeString}) ${session.room.subtitle || ""}`,
        };
        return renderGridCard(
          session.room.meeting.meetingId,
          session.start,
          session.end,
          tracksOfSession,
          <RoomCardNew
            room={roomWithTime}
            isDisabled={!isActive}
            isJoinable={isActive}
            isListMode={clientConfig.viewMode === "list"}
            fillHeight={true}
          />
        );
      } /*else if (groupId) {
        const { group, rooms } = groupsWithRooms[groupId];

        return renderGridCard(
          groupId,
          start,
          end,
          tracks,
          <ScheduleGroupGrid
            key={groupId}
            group={group}
            rooms={rooms}
            meetings={meetings}
            isDisabled={!isActive}
            isJoinable={isActive}
            isListMode={isListMode}
          />
        );
      }*/
      return "";
    });
  }

  function sessionIsActive({ start, end }: Session) {
    const zone = props.clientConfig?.timezone;
    const startTime = parseTime(start, zone).minus({ minute: clientConfig?.sessionStartMinutesOffset ?? 0 });
    const endTime = parseTime(end, zone);
    const now = DateTime.local();

    return startTime < now && endTime > now;
  }

  function renderGridCard(
    key: string,
    start: string,
    end: string,
    [trackStart, trackEnd]: [string, string?],
    card: any
  ) {
    const gridRowStart = `time-${start.replace(":", "")}`;
    const gridRowEnd = `time-${end.replace(":", "")}`;
    const gridColumn = trackEnd ? `track-${trackStart}-start / track-${trackEnd}-end` : `track-${trackStart}`;
    return (
      <div key={key} className={classes.card} style={{ gridRow: `${gridRowStart} / ${gridRowEnd}`, gridColumn }}>
        {card}
      </div>
    );
  }
};
