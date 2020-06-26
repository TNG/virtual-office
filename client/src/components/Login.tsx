import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Background from "./LoginBackground.jpg";
import axios from "axios";

const appTitle = process.env.REACT_APP_TITLE || "Virtual Office";

interface StyleConfig {
  backgroundUrl: string;
}

const useStyles = makeStyles<Theme, StyleConfig>((theme) => ({
  root: {
    backgroundColor: `${theme.palette.background.default}`,
    backgroundImage: (config) => `url(${config?.backgroundUrl || Background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    height: "100%",
    width: "100%",
  },
  heading: {
    fontWeight: 300,
  },
}));

const Login = () => {
  const [clientConfig, setClientConfig] = useState<StyleConfig>({
    backgroundUrl: Background,
  });
  const classes = useStyles(clientConfig);

  const signInWithSlack = () => {
    window.location.href = "/auth/slack";
  };

  useEffect(() => {
    axios.get("/api/clientConfig").then(({ data }) => setClientConfig(data));
  }, []);

  if (!clientConfig) {
    return null;
  }

  return (
    <Box
      className={classes.root}
      position={"absolute"}
      width={"100%"}
      height={"100%"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Box maxWidth={600} width={"20%"} minWidth={400} height={200}>
        <Paper className={classes.paper}>
          <Box p={4} textAlign={"center"}>
            <Typography className={classes.heading} variant={"h3"}>
              {appTitle}
            </Typography>
            <Box pt={3}>
              <Button onClick={() => signInWithSlack()}>
                <img
                  alt="Sign in with Slack"
                  src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
                  srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
                />
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
