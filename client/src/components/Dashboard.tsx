import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import { MeetingEvent } from "../../../server/express/types/MeetingEvent";
import { SocketContext } from "../socket/Context";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./MandelbrotBackground.png";
import RoomGrid from "./RoomGrid";
import { Meeting } from "../../../server/express/types/Meeting";
import { keyBy } from "lodash";
import { mapPotentiallyDisabledGroups, PotentiallyDisabledGroup } from "../disabledGroups";
import { selectGroupsWithRooms } from "../selectGroupsWithRooms";
import { mapMeetingEventToMeetings } from "../mapMeetingEventToMeetings";
import { Office } from "../../../server/express/types/Office";
import { Button, Theme } from "@material-ui/core";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { StyleConfig } from "../types";

const useStyles = makeStyles<Theme, StyleConfig>((theme) => ({
  background: {
    position: "fixed",
    height: "calc(100vh + 16px)",
    width: "calc(100vw + 16px)",
    top: -8,
    right: -8,
    bottom: -8,
    left: -8,
    backgroundColor: `${theme.palette.background.default}`,
    backgroundImage: (props) => `url(${props.backgroundUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(8px)",
    "-webkit-filter": "blur(8px)",
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
  },
  toggleGroupsButton: {
    textAlign: "center",
  },
  rooms: {
    marginTop: 24,
  },
}));

interface OfficeState {
  office: Office;
  potentiallyDisabledGroups: PotentiallyDisabledGroup[];
}

function officeStateFrom(office: Office): OfficeState {
  const groupsToRender = mapPotentiallyDisabledGroups(office.groups);
  return { office, potentiallyDisabledGroups: groupsToRender };
}

const Dashboard = () => {
  const history = useHistory();
  useEffect(() => {
    axios.get("/api/me").catch(() => history.push("/login"));
  }, [history]);

  const context = useContext(SocketContext);
  const [officeState, setOfficeState] = useState({
    office: { rooms: [], groups: [] },
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

    const officeSubscription = context.onOffice().subscribe((event) => setOfficeState(officeStateFrom(event)));

    const clientConfigSubscription = context.onClientConfig().subscribe((event) => setConfig(event));

    const initSubscription = context.onInit().subscribe((event) => {
      setOfficeState(officeStateFrom(event.office));
      setMeetings(event.meetings);
      setConfig(event.config);
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
    const handler = setInterval(() => setOfficeState(officeStateFrom(officeState.office)), 10000);
    return () => clearInterval(handler);
  }, [officeState]);

  const meetingsIndexed = keyBy(meetings, (meeting) => meeting.meetingId);
  const groupsWithRooms = selectGroupsWithRooms(meetingsIndexed, searchText, officeState.office);
  const hasExpiredGroups = officeState.potentiallyDisabledGroups.some((group) => group.isExpired);
  const hasNotExpiredGroups = officeState.potentiallyDisabledGroups.some((group) => !group.isExpired);

  if (!config) {
    return null;
  }

  return (
    <Box>
      <Box className={classes.background} />
      <Box className={classes.content}>
        <AppBar onSearchTextChange={setSearchText} />

        <Box className={classes.scroller}>
          {hasExpiredGroups && hasNotExpiredGroups && (
            <Box className={classes.toggleGroupsButton}>
              <Button color="secondary" size="small" onClick={() => setShowExpiredGroups(!showExpiredGroups)}>
                {showExpiredGroups ? "Hide expired" : "Show expired"}
              </Button>
            </Box>
          )}
          <Box className={classes.rooms}>
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
                  isListMode={config.viewMode === "list"}
                />
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
