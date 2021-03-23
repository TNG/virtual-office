import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import { MeetingEvent } from "../../../server/express/types/MeetingEvent";
import { SocketContext } from "../socket/Context";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./LoginBackground.jpg";
import { Meeting } from "../../../server/express/types/Meeting";
import { keyBy } from "lodash";
import { mapMeetingEventToMeetings } from "../mapMeetingEventToMeetings";
import { CircularProgress, Fade, Theme } from "@material-ui/core";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { StyleConfig } from "../types";
import { Footer } from "./Footer";
import { parseTime } from "../time";
import { DateTime } from "luxon";
import { OfficeWithBlocks, Block } from "../../../server/express/types/Office";
import { BlockGrid } from "./BlockGrid";
import { Session } from "../../../server/express/types/Session";
import useDeepCompareEffect from "use-deep-compare-effect";

/** Styles */
const useStyles = makeStyles<Theme, StyleConfig>((theme) => ({
  background: {
    height: "100%",
    backgroundColor: `${theme.palette.background.default}`,
    backgroundImage: (props) => `url(${props.backgroundUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  content: {
    height: "100%",
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
  loading: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10em",
  },
}));

/** Component */
const Dashboard = () => {
  const history = useHistory();
  useEffect(() => {
    axios.get("/api/me").catch(() => history.push("/login"));
  }, [history]);

  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const [meetings, setMeetings] = useState([] as Meeting[]);
  const [searchText, setSearchText] = useState("");
  const [config, setConfig] = useState<ClientConfig | undefined>();

  const context = useContext(SocketContext);

  const [office, setOffice] = useState<OfficeWithBlocks>({
    version: "2",
    blocks: [],
  });

  useEffect(() => {
    context.init();

    const stateUpdate = context.onNotify();
    const stateSubscription = stateUpdate.subscribe((incomingMessage: MeetingEvent) => {
      setMeetings((prevMeetings) => mapMeetingEventToMeetings(prevMeetings, incomingMessage));
    });

    const officeSubscription = context.onOffice().subscribe((event) => setOffice(event));
    const clientConfigSubscription = context.onClientConfig().subscribe((event) => setConfig(event));

    const initSubscription = context.onInit().subscribe((event) => {
      setConfig(event.config);
      setTimeout(() => {
        setOffice(event.office);
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

  useDeepCompareEffect(() => {
    const handler = setInterval(() => setOffice(office), 60000);
    return () => clearInterval(handler);
  }, [office]);

  const classes = useStyles({ backgroundUrl: Background, ...(config || {}) });
  const meetingsIndexed = keyBy(meetings, (meeting) => meeting.meetingId);

  if (config?.faviconUrl) {
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    const appleTouchIcon = document.getElementById("apple-touch-icon") as HTMLLinkElement;
    if (favicon && appleTouchIcon) {
      favicon.href = config.faviconUrl;
      appleTouchIcon.href = config.faviconUrl;
    }
  }

  function sessionIsOver({ alwaysActive, end }: Session): boolean {
    const zone = config?.timezone;
    const endTime = parseTime(end, zone);
    const now = DateTime.local();
    return !alwaysActive && now >= endTime;
  }

  function renderOffice(office: OfficeWithBlocks, config: ClientConfig) {
    // TODO: implement functionality to potentially hide ended sessions in schedule using if config.hideEndedSessions and sessionIsOver(session);
    // TODO: implement toggle button to show/hide expired groups as in renderRoomGrid() before
    // TODO: { rooms } = search(searchText) and selectGroupsWithRooms(searchText) as in renderSchedule() before

    return (
      <Fade in={initialLoadCompleted}>
        <div>
          {office.blocks.map((block: Block, index: number) => {
            return <BlockGrid key={index} block={block} clientConfig={config} meetings={meetingsIndexed} />;
          })}
        </div>
      </Fade>
    );
  }

  if (!config) {
    return null;
  }

  const content = initialLoadCompleted ? (
    renderOffice(office, config) // todo: why config not directly accessible inside renderOffice
  ) : (
    <Box className={classes.loading}>
      <CircularProgress color="secondary" size="100px" />
    </Box>
  );

  return (
    <div className={classes.background}>
      <div className={classes.content}>
        <AppBar onSearchTextChange={setSearchText} title={config.title} logoUrl={config.logoUrl} />
        <div className={classes.scroller}>{content}</div>
        {initialLoadCompleted ? <Footer /> : ""}
      </div>
    </div>
  );
};
export default Dashboard;
