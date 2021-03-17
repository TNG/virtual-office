import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import RoomCard from "./RoomCard";
import { Room } from "../../../server/express/types/Room";
import { partition } from "lodash";
import { RoomLegacy } from "../../../server/express/types/RoomLegacy";
import GroupJoinCard from "./GroupJoinCard";
import { GroupLegacy } from "../../../server/express/types/GroupLegacy";
import { Group } from "../../../server/express/types/Group";
import RoomCardNew from "./RoomCardNew";

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
}));

/** Props */
// TODO: check if all props required
interface Props {
  group: Group;
  isDisabled: boolean;
  isJoinable: boolean;
  isListMode: boolean;
}

/** Component */
export const GroupBlockGrid = (props: Props) => {
  const { group, isDisabled, isJoinable, isListMode } = props;
  const classes = useStyles(props);

  return (
    <div className={classes.root}>
      {renderGroupHeader()}
      <div className={classes.grid}>
        {renderGroupJoinCard()}
        {renderRoomCards()}
      </div>
    </div>
  );
  return (
    <div className={classes.grid}>
      {renderGroupJoinCard()}
      {renderRoomCards()}
    </div>
  );

  function renderGroupHeader() {
    const description = group.description && (
      <CardContent className={classes.groupHeaderCardContent}>
        <Typography variant="body2">{group.description}</Typography>
      </CardContent>
    );

    return (
      group.name && (
        <div className={`${classes.card}`}>
          <Card className={classes.groupHeaderCard}>
            <CardHeader
              className={classes.groupHeaderCardHeader}
              title={<Typography variant="h5">{group.name}</Typography>}
            />
            {description}
            <CardActions />
          </Card>
        </div>
      )
    );
  }

  // TODO: adapt to new data model (e.g. random join yields error right now)
  function renderGroupJoinCard() {
    if (!group.groupJoinConfig) {
      return;
    } else {
      const groupConvertedToLegacy: GroupLegacy = {
        id: group.name, // TODO: other id? ->
        name: group.name,
        description: group.description,
        disabledAfter: "",
        disabledBefore: "",
        joinableAfter: "",
        groupJoin: group.groupJoinConfig,
      };
      // todo: check props
      return renderGridCard(
        `group-join-${group.name}`,
        <GroupJoinCard
          group={groupConvertedToLegacy}
          isJoinable={isJoinable}
          isListMode={isListMode}
          fillHeight={true}
        />
      );
    }
  }

  // TODO: adapt to new data model
  function renderRoomCards() {
    const shownRooms = selectShownRooms();
    // todo: check props
    return shownRooms.map((room: Room) => {
      return renderGridCard(
        room.meeting.meetingId,
        <RoomCardNew
          room={room}
          isDisabled={isDisabled}
          isJoinable={isJoinable}
          isListMode={isListMode}
          fillHeight={true}
        />
      );
    });
  }

  function selectShownRooms() {
    if (!group.groupJoinConfig) {
      return group.rooms;
    } else {
      const [emptyRooms, filledRooms] = partition(group.rooms, (room) => room.meeting.participants.length === 0);
      return [...filledRooms, ...emptyRooms.slice(0, 1)];
    }
  }

  // TODO: outsource?
  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }
};
