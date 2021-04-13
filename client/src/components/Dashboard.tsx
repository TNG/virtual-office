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
import { OfficeWithBlocks, Block } from "../../../server/express/types/Office";
import { BlockGrid } from "./BlockGrid";
import { Session } from "../../../server/express/types/Session";
import useDeepCompareEffect from "use-deep-compare-effect";
import { search } from "../search";
import { sessionIsOver } from "../sessionTimeProps";
import { gql, useQuery } from "@apollo/client";
import { BLOCK_FRAGMENT_COMPLETE } from "../apollo/gqlQueries";
import { BlockApollo } from "../../../server/apollo/TypesApollo";

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

/** GraphQL Data */
const GET_OFFICE = gql`
  query getOffice {
    getOffice {
      id
      version
      blocks {
        ...BlockFragmentComplete
      }
    }
  }
  ${BLOCK_FRAGMENT_COMPLETE}
`;

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

  const { data, loading, error } = useQuery(GET_OFFICE);

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

  function renderOffice(config: ClientConfig) {
    /*if (config.hideEndedSessions) {
      office.blocks = office.blocks.map((block: Block) => {
        if (block.type === "SCHEDULE_BLOCK" || block.type === "SESSION_BLOCK") {
          block.sessions = block.sessions.filter((session: Session) => !sessionIsOver(session, config));
        }
        return block;
      });
    }

    let officeSearched: OfficeWithBlocks = search(searchText, office, meetingsIndexed);

    officeSearched.blocks = officeSearched.blocks.filter(
      (block: Block) => !(block.type === "GROUP_BLOCK" && block.group.rooms.length < 1)
    );

    officeSearched.blocks = officeSearched.blocks.map((block: Block) => {
      if (block.type === "SCHEDULE_BLOCK") {
        block.sessions = block.sessions.filter(
          (session: Session) => !(session.type === "GROUP_SESSION" && session.group.rooms.length < 1)
        );
      }
      return block;
    });

    return (
      <Fade in={initialLoadCompleted}>
        <div>
          {officeSearched.blocks.map((block: Block, index: number) => {
            return <BlockGrid key={index} block={block} clientConfig={config} meetings={meetingsIndexed} />;
          })}
        </div>
      </Fade>
    );*/

    if (loading) return <p>loading</p>;
    if (error) return <p>ERROR: {error.message}</p>;
    if (!data) return <p>Not found</p>;

    return (
      <Fade in={initialLoadCompleted}>
        <div>
          {data.getOffice.blocks.map((block: BlockApollo) => {
            return <BlockGrid key={block.id} id={block.id} clientConfig={config} meetings={meetingsIndexed} />;
          })}
        </div>
      </Fade>
    );
  }

  if (!config) {
    return null;
  }

  const content = initialLoadCompleted ? (
    renderOffice(config)
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
