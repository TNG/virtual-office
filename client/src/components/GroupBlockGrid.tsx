import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Card, CardActions, CardContent, CardHeader, Theme, Typography } from "@material-ui/core";
import { Room } from "../../../server/express/types/Room";
import { partition } from "lodash";
import { GroupLegacy } from "../../../server/express/types/GroupLegacy";
import { Group } from "../../../server/express/types/Group";
import RoomCardNew from "./RoomCardNew";
import GroupJoinCardNew from "./GroupJoinCardNew";

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
  group: Group;
  isActive: boolean;
  isListMode: boolean;
}

/** Component */
export const GroupBlockGrid = (props: Props) => {
  const { group, isActive, isListMode } = props;
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

  function renderGroupHeader() {
    const description = group.description && (
      <CardContent className={classes.groupHeaderCardContent}>
        <Typography variant="body2">{group.description}</Typography>
      </CardContent>
    );

    return (
      group.name && (
        <div className={`${classes.cardGroupHeader}`}>
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

  // TODO: adapt groupJoin to new data model
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
      return renderGridCard(
        `group-join-${group.name}`,
        <GroupJoinCardNew
          group={groupConvertedToLegacy}
          isActive={isActive}
          isListMode={isListMode}
          fillHeight={true}
        />
      );
    }
  }

  function renderRoomCards() {
    const shownRooms = selectShownRooms();
    return shownRooms.map((room: Room) => {
      return renderGridCard(
        room.meeting.meetingId,
        <RoomCardNew room={room} isActive={isActive} isListMode={isListMode} fillHeight={true} />
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

  function renderGridCard(key: string, card: any) {
    return (
      <div key={key} className={classes.card}>
        {card}
      </div>
    );
  }
};
