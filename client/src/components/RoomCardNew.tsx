import React, { useEffect, useRef } from "react";
import { compact } from "lodash";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import RoomIcon from "@material-ui/icons/People";

import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";
import { Room } from "../../../server/express/types/Room";

/** Styles */
const useStyles = makeStyles<Theme, Props>((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 12,
    boxSizing: "border-box",
    height: (props) => (props.fillHeight ? "100%" : undefined),
    opacity: (props) => (props.isActive ? 1 : 0.65),
  },
  header: {
    flex: "0 0 auto",
    padding: 0,
    minHeight: 40,
    alignItems: "flex-start",
  },
  headerContent: {
    overflow: "hidden",
  },
  subtitle: {
    display: "flex",
    alignItems: "flex-start",
  },
  collapsedSubtitle: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  expandedSubtitle: {
    whiteSpace: "pre-wrap",
  },
  body: {
    [theme.breakpoints.up("sm")]: {
      flexDirection: (props) => (props.isListMode ? "row" : "column"),
      alignItems: (props) => (props.isListMode ? "flex-end" : "stretch"),
    },
  },
  content: {
    flex: "0 1 100%",
    padding: "4px 8px 0 8px",
    display: "flex",
    alignItems: "stretch",
    flexDirection: "column-reverse",
    justifyContent: (props) => (props.isListMode ? "space-between" : "flex-end"),
    "&:last-child": {
      padding: "0 8px",
    },

    [theme.breakpoints.up("sm")]: {
      alignItems: (props) => (props.isListMode ? "center" : "stretch"),
      flexDirection: (props) => (props.isListMode ? "column" : "column-reverse"),
    },
  },
  participants: {
    flex: "0 0 auto",
    margin: "0 8px",
  },
  headerAvatar: {
    height: 40,
  },
  roomIcon: {
    height: 40,
    width: 40,
  },
  actions: {
    height: 44,
    padding: 0,
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "space-between",
  },
  titleLink: {
    color: theme.palette.common.black,
    textDecoration: "none",

    "&:hover": {
      textDecoration: "underline",
    },
  },
  expandButton: {
    cursor: "pointer",
  },
}));

/** Props */
interface Props {
  room: Room;
  isActive: boolean;
  isListMode: boolean;
  fillHeight?: boolean;
}

/** Component */
const RoomCard = (props: Props) => {
  const classes = useStyles(props);
  const { room, isActive, isListMode } = props;

  const subtitleRef = useRef(null);

  const [collapseSubtitle, setCollapseSubtitle] = React.useState(true);
  const [expandable, setExpandable] = React.useState(false);
  const [participantsOpen, setParticipantsOpen] = React.useState(false);

  useEffect((): any => {
    if (!subtitleRef?.current) {
      return;
    }
    setExpandable((subtitleRef.current as any).offsetWidth < (subtitleRef.current as any).scrollWidth);
  }, [subtitleRef]);

  function renderJoinUrl() {
    return (
      room.joinUrl &&
      isActive && (
        <Button size="small" color="secondary" variant="text" href={room.joinUrl} target="_blank">
          Join
        </Button>
      )
    );
  }

  function renderTitle() {
    const titleName = <Typography variant="h5">{room.name}</Typography>;
    if (!room.titleUrl) {
      return titleName;
    }

    return (
      <a className={classes.titleLink} href={room.titleUrl} target="_blank" rel="noopener noreferrer">
        {titleName}
      </a>
    );
  }

  const roomLinksView = (room.roomLinks ?? []).length > 0 && (
    <RoomLinks links={room.roomLinks} isListMode={isListMode} />
  );
  const contentView = roomLinksView && <CardContent className={classes.content}>{roomLinksView}</CardContent>;

  const joinUrlView = renderJoinUrl();
  const participantsView = isActive && room.meeting.meetingId && (
    <div className={classes.participants}>
      <RoomParticipants
        name={room.name}
        participants={room.meeting.participants}
        showParticipants={participantsOpen}
        setShowParticipants={setParticipantsOpen}
      />
    </div>
  );
  const actionsView = (joinUrlView || participantsView) && (
    <CardActions className={classes.actions}>
      {participantsView ?? <div />}
      {joinUrlView ?? <div />}
    </CardActions>
  );

  const bodyView = (contentView || actionsView) && (
    <div className={classes.body}>
      {contentView}
      {actionsView}
    </div>
  );

  function renderSubheader() {
    const subtitle = compact([room.subtitle, room.description]).join(" - ");
    const subtitleClass = collapseSubtitle ? classes.collapsedSubtitle : classes.expandedSubtitle;
    const expandButton = expandable && (
      <div className={classes.expandButton}>{collapseSubtitle ? <ExpandMore /> : <ExpandLess />}</div>
    );

    return (
      <div className={classes.subtitle} onClick={() => setCollapseSubtitle(!collapseSubtitle)}>
        <Typography variant="body2" className={subtitleClass} ref={subtitleRef}>
          {subtitle}
        </Typography>
        {expandButton}
      </div>
    );
  }

  return (
    <Card className={classes.root} key={room.meeting.meetingId}>
      <CardHeader
        classes={{ root: classes.header, content: classes.headerContent, avatar: classes.headerAvatar }}
        avatar={
          room.icon ? (
            <Avatar variant="square" src={room.icon} />
          ) : (
            <RoomIcon className={classes.roomIcon} color="action" />
          )
        }
        title={renderTitle()}
        subheader={renderSubheader()}
      />
      {bodyView}
    </Card>
  );
};
export default RoomCard;
