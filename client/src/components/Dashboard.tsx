import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import { SearchProvider } from "../socket/Context";

import Box from "@material-ui/core/Box/Box";
import AppBar from "./AppBar";
import Background from "./LoginBackground.jpg";
import { CircularProgress, Fade, Theme } from "@material-ui/core";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { StyleConfig } from "../types";
import { Footer } from "./Footer";
import { BlockGrid } from "./BlockGrid";
import { blockMatchesSearch } from "../search";
import { useQuery } from "@apollo/client";
import { BlockApollo } from "../../../server/apollo/TypesApollo";
import { GET_OFFICE_COMPLETE } from "../apollo/gqlQueries";

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

  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [config, setConfig] = useState<ClientConfig | undefined>();

  const { data, loading, error } = useQuery(GET_OFFICE_COMPLETE);

  const [blockIdsToRender, setBlockIdsToRender] = useState<string[]>([]);
  useEffect(() => {
    if (data) {
      (async function setIds() {
        const blocksMatch: boolean[] = await Promise.all(
          data.getOffice.blocks.map((block: BlockApollo) => blockMatchesSearch(block.id, searchText))
        );
        const blockIdsMatching: string[] = [];
        blocksMatch.forEach((matches, index) => {
          if (matches) {
            blockIdsMatching.push(data.getOffice.blocks[index].id);
          }
        });
        setBlockIdsToRender(blockIdsMatching);
      })();
    }
  }, [searchText, data]);

  function renderOffice(config: ClientConfig) {
    return (
      <Fade in={initialLoadCompleted}>
        <div>
          {blockIdsToRender.map((id: string) => {
            return <BlockGrid key={id} id={id} clientConfig={config} />;
          })}
        </div>
      </Fade>
    );
  }

  if (!config) {
    setConfig({
      viewMode: "grid",
      theme: "light",
      sessionStartMinutesOffset: 10,
      timezone: "Europe/Berlin",
      title: "Virtual Office",
      hideEndedSessions: false,
    });
    setInitialLoadCompleted(true);
  }

  if (config?.faviconUrl) {
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    const appleTouchIcon = document.getElementById("apple-touch-icon") as HTMLLinkElement;
    if (favicon && appleTouchIcon) {
      favicon.href = config.faviconUrl;
      appleTouchIcon.href = config.faviconUrl;
    }
  }

  const classes = useStyles({ backgroundUrl: Background, ...(config || {}) });

  if (!config) {
    return null;
  }

  if (loading) return <p>loading</p>;
  if (error) return <p>ERROR: {error.message}</p>;
  if (!data) return <p>Not found</p>;

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
        <SearchProvider value={searchText}>
          <AppBar onSearchTextChange={setSearchText} title={config.title} logoUrl={config.logoUrl} />
          <div className={classes.scroller}>{content}</div>
          {initialLoadCompleted ? <Footer /> : ""}
        </SearchProvider>
      </div>
    </div>
  );
};
