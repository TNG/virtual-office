import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { Room } from "../../../server/express/types/Room";
import { partition } from "lodash";
import { Group } from "../../../server/express/types/Group";
import RoomCard from "./RoomCard";
import GroupJoinCard from "./GroupJoinCard";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import { useQuery } from "@apollo/client";
import { GET_GROUP_SHORT } from "../apollo/gqlQueries";

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
  isListMode: boolean;
  meetings: MeetingsIndexed;
}

/** Component */
export const GroupBlockGrid = (props: Props) => {
  const { id, timeStringForDescription, isActive, isListMode, meetings } = props;
  const classes = useStyles(props);

  const { data, loading, error } = useQuery(GET_GROUP_SHORT, { variables: { id } });

  if (!data) return null;

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
    const descriptionWithTime = [timeStringForDescription, data.getGroup.description].filter(Boolean).join(" ");
    const description = descriptionWithTime && (
      <CardContent className={classes.groupHeaderCardContent}>
        <Typography variant="body2">{descriptionWithTime}</Typography>
      </CardContent>
    );

    return (
      data.getGroup.name && (
        <div className={`${classes.cardGroupHeader}`}>
          <Card className={classes.groupHeaderCard}>
            <CardHeader
              className={classes.groupHeaderCardHeader}
              title={<Typography variant="h5">{data.getGroup.name}</Typography>}
            />
            {description}
            <CardActions />
          </Card>
        </div>
      )
    );
  }

  function renderGroupJoinCard() {
    if (!data.getGroup.groupJoinConfig) {
      return;
    } else {
      return renderGridCard(
        `group-join-${data.getGroup.name}`,
        <GroupJoinCard
          id={data.getGroup.groupJoinConfig.id}
          groupName={data.getGroup.name}
          isActive={isActive}
          isListMode={isListMode}
          fillHeight={true}
        />
      );
    }
  }

  function renderRoomCards() {
    /*const shownRooms = selectShownRooms();
    return shownRooms.map((room: Room, index: number) => {
      const participants = participantsInMeeting(room.meetingId);
      return renderGridCard(
        index.toString(),
        <RoomCard roomName={roomName} isActive={isActive} isListMode={isListMode} fillHeight={true} meetings={meetings} />
      );
    });*/
    return data.getGroup.rooms.map((room: { id: string }) => {
      return renderGridCard(
        room.id,
        <RoomCard id={room.id} isActive={isActive} isListMode={isListMode} fillHeight={true} meetings={meetings} />
      );
    });
  }

  // TODO: to implement
  /*function selectShownRooms() {
    if (!data.group.groupJoinConfig) {
      return data.group.roomNames;
    } else {
      const [emptyRooms, filledRooms] = partition(
        data.group.roomNames,
        (room) => participantsInMeeting(room.meetingId).length === 0
      );
      return [...filledRooms, ...emptyRooms.slice(0, 1)];
    }
  }*/

  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }
};
