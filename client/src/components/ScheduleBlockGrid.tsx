import React from "react";
import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { browserTimeZone, parseTime, printHoursMinutes } from "../time";
import { DateTime } from "luxon";
import { Session } from "../../../server/express/types/Session";
import { Track } from "../../../server/express/types/Office";
import RoomCardNew from "./RoomCardNew";
import { GroupBlockGrid } from "./GroupBlockGrid";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { sessionIsActive } from "../sessionTimeProps";

/** Styles */
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
      value: value + `[${prevTrack ? `track-${prevTrack.name}-end ` : ""}track-${val.name}-start] minmax(0, 1fr)`,
      prevTrack: val,
    }),
    { value: "", prevTrack: undefined }
  );
  const lastTrack = tracks[tracks.length - 1];
  return result.value + `[track-${lastTrack.name}-end]`;
};

const useStyles = makeStyles<Theme, Props>((theme) => ({
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
  tracks: Track[];
  sessions: Session[];
  clientConfig: ClientConfig;
  meetings: MeetingsIndexed;
}

/** Component */
export const ScheduleBlockGrid = (props: Props) => {
  const { tracks, sessions, clientConfig, meetings } = props;
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

  function renderSchedule() {
    return sessions.map((session: Session, index: number) => {
      const tracksOfSession: [string, string?] = session.trackName
        ? [session.trackName]
        : [tracks[0].name, tracks[tracks.length - 1].name];

      const isActive = sessionIsActive(session, clientConfig);

      if (session.type === "ROOM_SESSION") {
        const formattedStart = printHoursMinutes(parseTime(session.start, clientConfig?.timezone));
        const formattedEnd = printHoursMinutes(parseTime(session.end, clientConfig?.timezone));
        const timezone = browserTimeZone();
        const timeString = `${formattedStart}-${formattedEnd}${clientConfig?.timezone ? ` ${timezone}` : ""}`;
        const roomWithTime = {
          ...session.room,
          subtitle: `(${timeString}) ${session.room.subtitle || ""}`,
        };
        const participants = participantsInMeeting(session.room.meetingId);

        return renderGridCard(
          index.toString(),
          classes.card,
          session.start,
          session.end,
          tracksOfSession,
          <RoomCardNew
            room={roomWithTime}
            isActive={isActive}
            isListMode={clientConfig.viewMode === "list"}
            fillHeight={true}
            participants={participants}
          />
        );
      } else if (session.type === "GROUP_SESSION") {
        return renderGridCard(
          session.group.name,
          classes.groupCard,
          session.start,
          session.end,
          tracksOfSession,
          <GroupBlockGrid
            group={session.group}
            isActive={isActive}
            isListMode={clientConfig.viewMode === "list"}
            meetings={meetings}
          />
        );
      }
      return "";
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
