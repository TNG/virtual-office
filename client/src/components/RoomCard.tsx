import React, { useEffect, useRef } from "react";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import RoomIcon from "@material-ui/icons/People";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

const useStyles = makeStyles<Theme, Props>((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 12,
    boxSizing: "border-box",
    height: (props) => (props.fillHeight ? "100%" : undefined),
    opacity: (props) => (props.isDisabled ? 0.65 : 1),
  },
  border: {
    border: "3px solid rgb(44, 106, 168)",
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
    flex: "1 0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    flexDirection: "column",

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
      flexDirection: (props) => (props.isListMode ? "row" : "column-reverse"),
    },
  },
  participants: {
    flex: "0 0 auto",
    marginRight: 8,
  },
  avatarGroup: {
    marginLeft: 8,
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
    flexDirection: "row-reverse",
  },
  titleLink: {
    color: theme.palette.common.black,
    textDecoration: "none",

    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

interface Props {
  room: Room;
  participants: MeetingParticipant[];
  isDisabled: boolean;
  isJoinable: boolean;
  isListMode: boolean;
  fillHeight?: boolean;
}

const RoomCard = (props: Props) => {
  const classes = useStyles(props);
  const { room, participants, isDisabled, isJoinable, isListMode } = props;

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
      isJoinable && (
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
      <a className={classes.titleLink} href={room.titleUrl}>
        {titleName}
      </a>
    );
  }

  const roomLinksView = (room.links ?? []).length > 0 && <RoomLinks links={room.links} isListMode={isListMode} />;
  const participantsView = (!isDisabled || isJoinable) && room.meetingId && (
    <div className={classes.participants}>
      <RoomParticipants
        name={room.name}
        participants={participants}
        showParticipants={participantsOpen}
        setShowParticipants={setParticipantsOpen}
      />
    </div>
  );

  const joinUrlView = renderJoinUrl();

  const bodyView = (roomLinksView || participantsView || joinUrlView) && (
    <div className={classes.body}>
      <CardContent className={classes.content}>
        {roomLinksView}
        {participantsView}
      </CardContent>

      <CardActions className={classes.actions}>{joinUrlView}</CardActions>
    </div>
  );

  return (
    <Card className={classes.root} key={room.roomId}>
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
        subheader={
          <div className={classes.subtitle} onClick={() => setCollapseSubtitle(!collapseSubtitle)}>
            <Typography
              variant="body2"
              className={collapseSubtitle ? classes.collapsedSubtitle : classes.expandedSubtitle}
              ref={subtitleRef}
            >
              {room.subtitle}
            </Typography>
            {expandable ? collapseSubtitle ? <ExpandMore /> : <ExpandLess /> : ""}
          </div>
        }
      />

      {bodyView}
    </Card>
  );
};
export default RoomCard;
