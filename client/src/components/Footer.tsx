import GitHubIcon from "@material-ui/icons/GitHub";
import React from "react";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  footer: {
    color: "#fff",
    textAlign: "center",
    fontSize: 15,
    marginBottom: 16,
  },
  footerLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
  },
  footerIcon: {
    color: "#fff",
    fontSize: 15,
  },
}));

export const Footer = () => {
  const classes = useStyles();

  return (
    <div className={classes.footer}>
      Powered by{" "}
      <a className={classes.footerLink} href="https://github.com/TNG/virtual-office">
        <GitHubIcon className={classes.footerIcon} />
        &nbsp;TNG/virtual-office
      </a>
    </div>
  );
};
