import React, { useEffect, useRef } from "react";
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  hidden: {
    opacity: 0.4,
  },
  border: {
    border: "3px solid rgb(44, 106, 168)",
  },
  header: {
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
  },
  headerTitleLink: {
    textDecoration: "none",
    color: "inherit",
  },
  headerSubtitle: {
    fontSize: 14,
    paddingTop: 4,
  },
  content: {
    paddingTop: 0,
    paddingBottom: 4,
  },
  descriptionParagraph: {
    paddingTop: 0,
    paddingBottom: 4,
  },
  avatarGroup: {
    marginLeft: 8,
  },
  actions: {
    display: "flex",
    flexDirection: "row-reverse",
  },
});

const RoomCard = ({
  room,
  isHidden,
}: {
  room: RoomWithParticipants & { shouldFocus?: boolean };
  isHidden: boolean;
}) => {
  const classes = useStyles();

  const scrollRef: any = useRef();
  useEffect(() => {
    if (room.shouldFocus) {
      window.scrollTo({ behavior: "smooth", top: scrollRef.current.offsetTop });
    }
  }, [room]);

  function renderJoinUrl() {
    return (
      room.joinUrl && (
        <Button size="small" color="secondary" variant="text" href={room.joinUrl} target="_blank">
          Join
        </Button>
      )
    );
  }

  const isDescriptionCard = room.hasNoZoomRoom && room.description;
  return (
    <Card className={`${classes.root} ${room.shouldFocus ? classes.border : ""}`} key={room.id} ref={scrollRef}>
      <a
        className={`${classes.headerTitleLink} ${isDescriptionCard ? "" : classes.header}`}
        href={room.titleLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <CardHeader
          classes={{ root: classes.header, subheader: `${classes.headerSubtitle} ${isHidden ? classes.hidden : ""}` }}
          avatar={room.icon ? <Avatar variant="square" src={room.icon} /> : undefined}
          title={
            <Typography variant="h5" className={`${classes.headerTitle} ${isHidden ? classes.hidden : ""}`}>
              {room.name}
            </Typography>
          }
          subheader={
            room.subtitleLink ? (
              <a className={classes.headerTitleLink} href={room.subtitleLink} target="_blank" rel="noopener noreferrer">
                {room.subtitle}
              </a>
            ) : (
              room.subtitle
            )
          }
        />
      </a>
      <CardContent className={classes.content}>
        <Box>
          {room.description ? (
            <a className={classes.headerTitleLink} href={room.titleLink} target="_blank" rel="noopener noreferrer">
              <Typography variant="subtitle2">
                {room.description.split("\n").map((item, i) => (
                  <p className={classes.descriptionParagraph} key={i}>
                    {item}
                  </p>
                ))}
              </Typography>
            </a>
          ) : (
            ""
          )}
          <RoomLinks links={room.links} isHidden={isHidden} />
          {isHidden || room.hasNoZoomRoom ? "" : <RoomParticipants name={room.name} participants={room.participants} />}
        </Box>
      </CardContent>

      <CardActions className={classes.actions}>{renderJoinUrl()}</CardActions>
    </Card>
  );
};
export default RoomCard;
