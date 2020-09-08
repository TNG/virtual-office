import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import { MeetingEvent } from "../../../server/express/types/MeetingEvent";
import { SocketContext } from "../socket/Context";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./LoginBackground.jpg";
import RoomGrid from "./RoomGrid";
import { Meeting } from "../../../server/express/types/Meeting";
import { keyBy } from "lodash";
import { mapPotentiallyDisabledGroups, PotentiallyDisabledGroup } from "../disabledGroups";
import { GroupWithRooms, selectGroupsWithRooms } from "../selectGroupsWithRooms";
import { mapMeetingEventToMeetings } from "../mapMeetingEventToMeetings";
import { Office } from "../../../server/express/types/Office";
import { Button, CircularProgress, Fade, Theme } from "@material-ui/core";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { StyleConfig } from "../types";
import ScheduleGrid from "./ScheduleGrid";
import { Schedule } from "../../../server/express/types/Schedule";
import { search } from "../search";

const useStyles = makeStyles<Theme, StyleConfig>((theme) => ({
  background: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: `${theme.palette.background.default}`,
    backgroundImage: (props) => `url(${props.backgroundUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
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
  scroller: {
    maxWidth: 1200,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 12,
    paddingTop: 56,
    [theme.breakpoints.up("sm")]: {
      paddingTop: 64,
    },
    padding: 12,
    [theme.breakpoints.up("xl")]: {
      maxWidth: 1500,
    },
  },
  toggleGroupsButton: {
    textAlign: "center",
  },
  rooms: {
    marginTop: 24,
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10em",
  },
}));

interface OfficeState {
  office: Office;
  potentiallyDisabledGroups: PotentiallyDisabledGroup[];
}

function officeStateFrom(office: Office, timezone?: string): OfficeState {
  const groupsToRender = mapPotentiallyDisabledGroups(office.groups, timezone);
  return { office, potentiallyDisabledGroups: groupsToRender };
}

const Dashboard = () => {
  const history = useHistory();
  useEffect(() => {
    axios.get("/api/me").catch(() => history.push("/login"));
  }, [history]);

  const context = useContext(SocketContext);
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const [officeState, setOfficeState] = useState({
    office: { rooms: [], groups: [], schedule: undefined },
    potentiallyDisabledGroups: [],
  } as OfficeState);
  const [meetings, setMeetings] = useState([] as Meeting[]);
  const [searchText, setSearchText] = useState("");
  const [showExpiredGroups, setShowExpiredGroups] = useState(false);
  const [config, setConfig] = useState<ClientConfig | undefined>();

  const classes = useStyles({ backgroundUrl: Background, ...(config || {}) });
  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    const stateSubscription = stateUpdate.subscribe((incomingMessage: MeetingEvent) => {
      setMeetings((prevMeetings) => mapMeetingEventToMeetings(prevMeetings, incomingMessage));
    });

    const officeSubscription = context
      .onOffice()
      .subscribe((event) => setOfficeState(officeStateFrom(event, config?.timezone)));
    const clientConfigSubscription = context.onClientConfig().subscribe((event) => setConfig(event));

    const initSubscription = context.onInit().subscribe((event) => {
      setConfig(event.config);
      setTimeout(() => {
        setOfficeState(officeStateFrom(event.office));
        setMeetings(event.meetings);
        setInitialLoadCompleted(true);
      }, 500);
    });

    return () => {
      stateSubscription.unsubscribe();
      initSubscription.unsubscribe();
      context.disconnect();
      officeSubscription.unsubscribe();
      clientConfigSubscription.unsubscribe();
    };
  }, [context]);

  useEffect(() => {
    const handler = setInterval(() => setOfficeState(officeStateFrom(officeState.office)), 60000);
    return () => clearInterval(handler);
  }, [officeState]);

  const meetingsIndexed = keyBy(meetings, (meeting) => meeting.meetingId);

  function renderSchedule(schedule: Schedule, viewMode: string) {
    const { rooms } = search(searchText, officeState.office, meetingsIndexed);
    const roomsIndexed = keyBy(rooms, (room) => room.roomId);

    const groupsWithRooms = selectGroupsWithRooms(meetingsIndexed, searchText, officeState.office);
    const groupsWithRoomsIndexed = keyBy<GroupWithRooms>(groupsWithRooms, ({ group }) => group.id);

    return (
      <ScheduleGrid
        meetings={meetingsIndexed}
        rooms={roomsIndexed}
        groupsWithRooms={groupsWithRoomsIndexed}
        schedule={schedule}
        isListMode={viewMode === "list"}
        clientConfig={config}
      />
    );
  }

  function renderRoomGrid(viewMode: string) {
    const groupsWithRooms = selectGroupsWithRooms(meetingsIndexed, searchText, officeState.office);
    const hasExpiredGroups = officeState.potentiallyDisabledGroups.some((group) => group.isExpired);
    const hasNotExpiredGroups = officeState.potentiallyDisabledGroups.some((group) => !group.isExpired);

    return (
      <Fade in={initialLoadCompleted}>
        <div>
          {hasExpiredGroups && hasNotExpiredGroups && (
            <Box className={classes.toggleGroupsButton}>
              <Button color="secondary" size="small" onClick={() => setShowExpiredGroups(!showExpiredGroups)}>
                {showExpiredGroups ? "Hide expired" : "Show expired"}
              </Button>
            </Box>
          )}
          <div className={classes.rooms}>
            {groupsWithRooms.map(({ group, rooms }) => {
              const potentiallyDisabledGroup = officeState.potentiallyDisabledGroups.find(
                (disabledGroup) => disabledGroup.group === group
              );
              const isDisabled =
                (potentiallyDisabledGroup &&
                  (potentiallyDisabledGroup.isExpired || potentiallyDisabledGroup.isUpcoming)) ||
                false;

              if (potentiallyDisabledGroup?.isExpired && !showExpiredGroups && hasNotExpiredGroups) {
                return null;
              }

              return (
                <RoomGrid
                  key={group.id}
                  group={group}
                  rooms={rooms}
                  meetings={meetingsIndexed}
                  isDisabled={isDisabled}
                  isJoinable={potentiallyDisabledGroup ? potentiallyDisabledGroup.isJoinable : true}
                  isListMode={viewMode === "list"}
                />
              );
            })}
          </div>
        </div>
      </Fade>
    );
  }

  if (!config) {
    return null;
  }

  const content = initialLoadCompleted ? (
    officeState.office.schedule ? (
      renderSchedule(officeState.office.schedule, config.viewMode)
    ) : (
      renderRoomGrid(config.viewMode)
    )
  ) : (
    <Box className={classes.loading}>
      <CircularProgress color="secondary" size="100px" />
    </Box>
  );

  return (
    <div>
      <div className={classes.background} />
      <div className={classes.content}>
        <AppBar onSearchTextChange={setSearchText} />
        <div className={classes.scroller}>{content}</div>
      </div>
    </div>
  );
};

export default Dashboard;
