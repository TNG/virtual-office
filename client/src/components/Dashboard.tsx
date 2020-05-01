import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import { MeetingEvent } from "../../../server/express/types/MeetingEvent";
import { Office } from "../../../server/express/types/Office";
import { SocketContext } from "../socket/Context";
import { search } from "../search";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./LoginBackground.jpg";
import RoomGrid from "./RoomGrid";
import theme from "../theme";
import { Group } from "../../../server/express/types/Group";
import { Meeting } from "../../../server/express/types/Meeting";
import { keyBy } from "lodash";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { Room } from "../../../server/express/types/Room";

const useStyles = makeStyles<typeof theme>((theme) => ({
  background: {
    height: "100vh",
    backgroundImage: `url(${Background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(8px)",
    "-webkit-filter": "blur(8px)",
    opacity: 0.8,
  },
  content: {
    position: "fixed",
    height: "100vh",
    width: "100vw",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflowY: "auto",
  },
  rooms: {
    marginTop: 12,
    paddingTop: 56,
    [theme.breakpoints.up("sm")]: {
      paddingTop: 64,
    },
    padding: 12,
  },
}));

const mapMeetingEventToMeetings = (meetings: Meeting[], event: MeetingEvent): Meeting[] => {
  function applyEventTo(meeting: Meeting): Meeting {
    switch (event.type) {
      case "join":
        return { ...meeting, participants: [...meeting.participants, event.participant] };
      case "leave":
        return {
          ...meeting,
          participants: meeting.participants.filter(({ id }) => id !== event.participant.id),
        };
      case "update":
        return {
          ...meeting,
          participants: meeting.participants
            .filter(({ id }) => id !== event.participant.id)
            .concat([event.participant]),
        };
    }
    return meeting;
  }

  return meetings.map((meeting) => (meeting.meetingId === event.meetingId ? applyEventTo(meeting) : meeting));
};

const Dashboard = ({ location }: any) => {
  const classes = useStyles();

  const history = useHistory();
  useEffect(() => {
    axios.get("/api/me").catch(() => history.push("/login"));
  }, [history]);

  const context = useContext(SocketContext);
  const [office, setOffice] = useState({ rooms: [], groups: [] } as Office);
  const [meetings, setMeetings] = useState([] as Meeting[]);

  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    const stateSubscription = stateUpdate.subscribe((incomingMessage: MeetingEvent) => {
      setMeetings((prevMeetings) => mapMeetingEventToMeetings(prevMeetings, incomingMessage));
    });

    const officeSubscription = context.onOffice().subscribe((event) => setOffice(event));

    const initSubscription = context.onInit().subscribe((event) => {
      setOffice(event.office);
      setMeetings(event.meetings);
    });

    return () => {
      stateSubscription.unsubscribe();
      initSubscription.unsubscribe();
      context.disconnect();
      officeSubscription.unsubscribe();
    };
  }, [context]);

  const [searchText, setSearchText] = useState("");

  function selectGroupsWithRooms(meetings: MeetingsIndexed) {
    const searchResult = search(searchText, office, meetings);
    const undefinedGroup: Group = {
      id: "",
      name: "",
    };

    const groups = [undefinedGroup, ...searchResult.groups];
    return groups
      .filter((group) => !group.hideAfter || new Date(group.hideAfter) > new Date())
      .map((group) => {
        const rooms = searchResult.rooms
          .filter((room) => (room.groupId || undefinedGroup.id) === group.id)
          .map(shouldFocus(location));

        return {
          group,
          rooms,
        };
      })
      .filter((entry) => entry.rooms.length > 0)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));
  }

  const meetingsIndexed = keyBy(meetings, (meeting) => meeting.meetingId);
  const groupsWithRooms = selectGroupsWithRooms(meetingsIndexed);
  return (
    <Box>
      <Box className={classes.background} />
      <Box className={classes.content}>
        <AppBar onSearchTextChange={setSearchText} />

        <Box className={classes.rooms}>
          {groupsWithRooms.map(({ group, rooms }) => (
            <RoomGrid key={group.id} group={group} rooms={rooms} meetings={meetingsIndexed} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

const shouldFocus = (location: Location) => (room: Room): Room & { shouldFocus?: boolean } => {
  const params = new URLSearchParams(location.search);
  const talkId = params.get("talk");
  if (room.roomId === talkId) {
    return { ...room, shouldFocus: true };
  }
  return room;
};
