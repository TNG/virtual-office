import React from "react";
import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import RoomCard from "./RoomCard";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { Schedule, Track } from "../../../server/express/types/Schedule";
import { DateTime } from "luxon";
import { GroupWithRooms } from "../selectGroupsWithRooms";
import ScheduleGroupGrid from "./ScheduleGroupGrid";

const calculateGridTemplateRows = ({ sessions }: Schedule) => {
  const earliestStart = sessions
    .map(({ start }) => DateTime.fromFormat(start, "HH:mm"))
    .sort()
    .shift();
  const latestEnd = sessions
    .map(({ end }) => DateTime.fromFormat(end, "HH:mm"))
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

const calculateGridTemplateColumns = ({ tracks }: Schedule) => {
  const result = tracks.reduce(
    ({ value, prevTrack }, val) => ({
      value: value + `[${prevTrack ? `track-${prevTrack.id}-end ` : ""}track-${val.id}-start] 1fr `,
      prevTrack: val,
    }),
    { value: "[times] 4em ", prevTrack: undefined as Track | undefined }
  );
  const lastTrack = tracks[tracks.length - 1];
  return result.value + `[track-${lastTrack.id}-end]`;
};

const useStyles = makeStyles<Theme, Schedule>((theme) => ({
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

export interface RoomsIndexed {
  [roomId: string]: Room;
}

export interface GroupsWithRoomsIndexed {
  [groupId: string]: GroupWithRooms;
}

interface Props {
  schedule: Schedule;
  rooms: RoomsIndexed;
  meetings: MeetingsIndexed;
  groupsWithRooms: GroupsWithRoomsIndexed;
  isListMode: boolean;
}

const ScheduleGrid = (props: Props) => {
  const { schedule, rooms, groupsWithRooms, meetings, isListMode } = props;
  const classes = useStyles(schedule);

  function renderTrackHeader() {
    return (
      <>
        {schedule.tracks.map(({ id, name }) => {
          return (
            <div
              key={`track-${id}`}
              className={classes.trackHeader}
              style={{ gridRow: `trackHeader`, gridColumn: `track-${id}` }}
            >
              {name}
            </div>
          );
        })}
      </>
    );
  }

  function participantsInMeeting(meetingId: string): MeetingParticipant[] {
    if (meetings[meetingId]) {
      return meetings[meetingId].participants;
    }
    return [];
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

  function renderSchedule() {
    const sessionsWithRoomsOrGroups = schedule.sessions.filter(
      ({ roomId, groupId }) => (roomId && rooms[roomId]) || (groupId && groupsWithRooms[groupId])
    );
    return sessionsWithRoomsOrGroups.map(({ roomId, groupId, start, end, trackId, alwaysActive }) => {
      const startTime = DateTime.fromFormat(start, "HH:mm").minus({ minute: 5 });
      const endTime = DateTime.fromFormat(end, "HH:mm");
      const now = DateTime.local();

      const tracks: [string, string?] = trackId
        ? [trackId]
        : [schedule.tracks[0].id, schedule.tracks[schedule.tracks.length - 1].id];

      const isDisabled = !alwaysActive && (startTime > now || endTime < now);
      const isJoinable = alwaysActive || (startTime < now && endTime > now);

      if (roomId) {
        const room = rooms[roomId];
        const participants = participantsInMeeting(room.meetingId);

        return renderGridCard(
          roomId,
          start,
          end,
          tracks,
          <RoomCard
            room={{ ...room, subtitle: `(${start} - ${end}) ${room.subtitle || ""}` }}
            participants={participants}
            isDisabled={isDisabled}
            isJoinable={isJoinable}
            isListMode={isListMode}
            fillHeight={true}
          />
        );
      } else if (groupId) {
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
            isDisabled={isDisabled}
            isJoinable={isJoinable}
            isListMode={isListMode}
          />
        );
      }
      return "";
    });
  }

  return (
    <div className={classes.root}>
      <div className={classes.schedule}>
        {renderTrackHeader()}
        {renderSchedule()}
      </div>
    </div>
  );
};

export default ScheduleGrid;
