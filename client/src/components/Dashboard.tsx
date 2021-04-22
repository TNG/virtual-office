import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./LoginBackground.jpg";
import { CircularProgress, Fade, Theme } from "@material-ui/core";
import { StyleConfig } from "../types";
import { Footer } from "./Footer";
import { BlockGrid } from "./BlockGrid";
import { applySearchToOffice } from "../search";
import { useQuery } from "@apollo/client";
import {
  GET_CLIENT_CONFIG_COMPLETE,
  GET_MEETINGS_COMPLETE,
  GET_OFFICE_COMPLETE,
  GET_OFFICE_SHORT,
} from "../apollo/gqlQueries";
import { getApolloClient } from "../apollo/ApolloClient";
import { ClientConfigApollo } from "../../../server/apollo/TypesApollo";

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
export const Dashboard = () => {
  /*const history = useHistory();
  useEffect(() => {
    axios.get("/api/me").catch(() => history.push("/login"));
  }, [history]);*/

  const [initialLoadCompleted, setInitialLoadCompleted] = useState(true);
  const [searchText, setSearchText] = useState("");

  const { data: officeData, loading: officeLoading, error: officeError } = useQuery(GET_OFFICE_COMPLETE);
  const { data: meetingsData, loading: meetingsLoading, error: meetingsError } = useQuery(GET_MEETINGS_COMPLETE);
  const { data: clientConfigData, loading: clientConfigLoading, error: clientConfigError } = useQuery<{
    getClientConfig: ClientConfigApollo;
  }>(GET_CLIENT_CONFIG_COMPLETE);
  const { data: blocksData, loading: blocksLoading, error: blocksError } = useQuery(GET_OFFICE_SHORT);

  const classes = useStyles({
    ...(clientConfigData ? clientConfigData.getClientConfig : {}),
    backgroundUrl: Background,
  });

  useEffect(() => {
    if (officeData && meetingsData) {
      applySearchToOffice(officeData.getOffice, meetingsData.getMeetings, searchText, getApolloClient());
    }
  }, [searchText, officeData, meetingsData]);

  function renderOffice() {
    if (!clientConfigData) return null;

    return (
      <Fade in={initialLoadCompleted}>
        <div>
          {blocksData.getOffice.blocks.map((block: any) => {
            return block.isInSearch && <BlockGrid key={block.id} id={block.id} />;
          })}
        </div>
      </Fade>
    );
  }

  if (!clientConfigData) {
    return null;
  }

  if (clientConfigData.getClientConfig.faviconUrl) {
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    const appleTouchIcon = document.getElementById("apple-touch-icon") as HTMLLinkElement;
    if (favicon && appleTouchIcon) {
      favicon.href = clientConfigData.getClientConfig.faviconUrl;
      appleTouchIcon.href = clientConfigData.getClientConfig.faviconUrl;
    }
  }

  // TODO: check
  if (officeLoading || meetingsLoading || clientConfigLoading) return <p>loading</p>;
  if (officeError) return <p>ERROR: {officeError.message}</p>;
  if (meetingsError) return <p>ERROR: {meetingsError.message}</p>;
  if (clientConfigError) return <p>ERROR: {clientConfigError.message}</p>;
  if (!officeData || !meetingsData || !clientConfigData || !blocksData) {
    return <p>Not found</p>;
  } else {
    //setInitialLoadCompleted(true);
  }

  const content = initialLoadCompleted ? (
    renderOffice()
  ) : (
    <Box className={classes.loading}>
      <CircularProgress color="secondary" size="100px" />
    </Box>
  );

  return (
    <div className={classes.background}>
      <div className={classes.content}>
        <AppBar
          onSearchTextChange={setSearchText}
          title={clientConfigData.getClientConfig.title}
          logoUrl={clientConfigData.getClientConfig.logoUrl}
        />
        <div className={classes.scroller}>{content}</div>
        {initialLoadCompleted ? <Footer /> : ""}
      </div>
    </div>
  );
};
