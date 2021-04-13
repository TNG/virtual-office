import React, { useEffect, useRef } from "react";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import RoomIcon from "@material-ui/icons/People";

import RoomParticipants from "./RoomParticipants";
import RoomLinks from "./RoomLinks";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { gql, useQuery } from "@apollo/client";
import { ROOM_FRAGMENT_SHORT } from "../apollo/gqlQueries";

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
  description: {
    display: "flex",
    alignItems: "flex-start",
  },
  collapsedDescription: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  expandedDescription: {
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

/** GraphQL Data */
const GET_ROOM = gql`
  query getRoom($id: ID!) {
    getRoom(id: $id) {
      ...RoomFragmentShort
    }
  }
  ${ROOM_FRAGMENT_SHORT}
`;

/** Props */
interface Props {
  id: string;
  timeStringForDescription?: string;
  isActive: boolean;
  isListMode: boolean;
  fillHeight?: boolean;
  meetings: MeetingsIndexed;
}

/** Component */
const RoomCard = (props: Props) => {
  const classes = useStyles(props);
  const { id, timeStringForDescription, isActive, isListMode, meetings } = props;

  const { data, loading, error } = useQuery(GET_ROOM, { variables: { id } });

  const descriptionRef = useRef(null);

  const [collapseDescription, setCollapseDescription] = React.useState(true);
  const [expandable, setExpandable] = React.useState(false);
  const [participantsOpen, setParticipantsOpen] = React.useState(false);

  useEffect((): any => {
    if (!descriptionRef?.current) {
      return;
    }
    setExpandable((descriptionRef.current as any).offsetWidth < (descriptionRef.current as any).scrollWidth);
  }, [descriptionRef]);

  if (!data) return null;

  function participantsInMeeting(meetingId: string | undefined): MeetingParticipant[] {
    if (meetingId && meetings[meetingId]) {
      return meetings[meetingId].participants;
    }
    return [];
  }

  function renderJoinUrl() {
    return (
      data.getRoom.joinUrl &&
      isActive && (
        <Button size="small" color="secondary" variant="text" href={data.getRoom.joinUrl} target="_blank">
          Join
        </Button>
      )
    );
  }

  function renderTitle() {
    const titleName = <Typography variant="h5">{data.getRoom.name}</Typography>;
    if (!data.getRoom.titleUrl) {
      return titleName;
    }

    return (
      <a className={classes.titleLink} href={data.getRoom.titleUrl} target="_blank" rel="noopener noreferrer">
        {titleName}
      </a>
    );
  }

  const roomLinksView = (data.getRoom.roomLinks ?? []).length > 0 && (
    <RoomLinks ids={data.getRoom.roomLinks.map((roomLink: { id: string }) => roomLink.id)} isListMode={isListMode} />
  );
  const contentView = roomLinksView && <CardContent className={classes.content}>{roomLinksView}</CardContent>;

  const joinUrlView = renderJoinUrl();

  const participantsView = isActive && data.getRoom.meetingId && (
    <div className={classes.participants}>
      <RoomParticipants
        name={data.getRoom.name}
        participants={participantsInMeeting(data.getRoom.meetingId)}
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
    const descriptionClass = collapseDescription ? classes.collapsedDescription : classes.expandedDescription;
    const expandButton = expandable && (
      <div className={classes.expandButton}>{collapseDescription ? <ExpandMore /> : <ExpandLess />}</div>
    );

    const descriptionWithTime = [timeStringForDescription, data.getRoom.description].filter(Boolean).join(" ");

    return (
      <div className={classes.description} onClick={() => setCollapseDescription(!collapseDescription)}>
        <Typography variant="body2" className={descriptionClass} ref={descriptionRef}>
          {descriptionWithTime}
        </Typography>
        {expandButton}
      </div>
    );
  }

  return (
    <Card className={classes.root} key={data.getRoom.meetingId}>
      <CardHeader
        classes={{ root: classes.header, content: classes.headerContent, avatar: classes.headerAvatar }}
        avatar={
          data.getRoom.icon ? (
            <Avatar variant="square" src={data.getRoom.icon} />
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
