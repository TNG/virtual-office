import { Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box/Box";
import React from "react";

export const Header = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h3">Virtual Big Techday 13</Typography>
      <Box paddingTop={1}>
        <Typography variant="h4">Live-Programm</Typography>
      </Box>
      <Box display="flex" justifyContent="center" marginTop={2}>
        <img alt="Super Collider" width="100%" src="/images/BTD7_SuperCollider.jpg" />
      </Box>
    </Box>
  );
};
