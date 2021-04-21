import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import RoomCard from "./RoomCard";
import GroupJoinCard from "./GroupJoinCard";
import { useQuery } from "@apollo/client";
import { GET_GROUP_SHORT, GET_MEETINGS_COMPLETE } from "../apollo/gqlQueries";
import { partition } from "lodash";
import { MeetingApollo, ParticipantApollo } from "../../../server/apollo/TypesApollo";

/** Styles */
const useStyles = makeStyles<Theme, Props>((theme) => ({
  grid: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  card: {
    width: "100%",
    flex: "0 0 auto",
    padding: 8,
    boxSizing: "border-box",
    [theme.breakpoints.up("sm")]: {
      width: "50%",
    },
    [theme.breakpoints.up("md")]: {
      width: "33.33%",
    },
    [theme.breakpoints.up("lg")]: {
      width: "33.33%",
    },
    [theme.breakpoints.up("xl")]: {
      width: "25%",
    },
  },
  cardGroupHeader: {
    padding: 8,
  },
  groupHeaderCard: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
    },
    opacity: (props) => (props.isActive ? 1 : 0.65),
  },
  groupHeaderCardHeader: {
    flex: "0 0 auto",
    minHeight: 40,
  },
  groupHeaderCardContent: {
    display: "flex",
    flex: "1 1 auto",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    flexGrow: 1,
  },
}));

/** Props */
interface Props {
  id: string;
  timeStringForDescription?: string;
  isActive: boolean;
}

/** Component */
export const GroupBlockGrid = (props: Props) => {
  const { id, timeStringForDescription, isActive } = props;
  const classes = useStyles(props);

  const { data: groupData, loading: groupLoading, error: groupError } = useQuery(GET_GROUP_SHORT, {
    variables: { id },
  });
  const { data: meetingsData, loading: meetingsLoading, error: meetingsError } = useQuery(GET_MEETINGS_COMPLETE);

  if (!groupData) return null;

  return (
    <div className={classes.root}>
      {renderGroupHeader()}
      <div className={classes.grid}>
        {renderGroupJoinCard()}
        {renderRoomCards()}
      </div>
    </div>
  );

  function renderGroupHeader() {
    const descriptionWithTime = [timeStringForDescription, groupData.getGroup.description].filter(Boolean).join(" ");
    const description = descriptionWithTime && (
      <CardContent className={classes.groupHeaderCardContent}>
        <Typography variant="body2">{descriptionWithTime}</Typography>
      </CardContent>
    );

    return (
      groupData.getGroup.name && (
        <div className={`${classes.cardGroupHeader}`}>
          <Card className={classes.groupHeaderCard}>
            <CardHeader
              className={classes.groupHeaderCardHeader}
              title={<Typography variant="h5">{groupData.getGroup.name}</Typography>}
            />
            {description}
            <CardActions />
          </Card>
        </div>
      )
    );
  }

  function renderGroupJoinCard() {
    if (!groupData.getGroup.groupJoinConfig) {
      return;
    } else {
      return renderGridCard(
        `group-join-${groupData.getGroup.name}`,
        <GroupJoinCard
          id={groupData.getGroup.groupJoinConfig.id}
          groupName={groupData.getGroup.name}
          isActive={isActive}
          fillHeight={true}
        />
      );
    }
  }

  function renderRoomCards() {
    const shownRooms: { id: string; meetingId: string }[] = selectShownRooms();
    return shownRooms.map((room: any) => {
      return (
        room.isInSearch && renderGridCard(room.id, <RoomCard id={room.id} isActive={isActive} fillHeight={true} />)
      );
    });
  }

  function selectShownRooms(): { id: string; meetingId: string }[] {
    if (!groupData.getGroup.groupJoinConfig) {
      return groupData.getGroup.rooms;
    } else {
      const [emptyRooms, filledRooms] = partition(
        groupData.getGroup.rooms,
        (room) => participantsInMeeting(room.meetingId).length === 0
      );
      return [...filledRooms, ...emptyRooms.slice(0, 1)];
    }
  }

  function participantsInMeeting(meetingId: string | undefined): ParticipantApollo[] {
    const meeting: MeetingApollo | undefined = meetingsData.getMeetings.find(
      (meeting: MeetingApollo) => meeting.id === meetingId
    );
    if (meeting) {
      return meeting.participants;
    }
    return [];
  }

  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }
};
