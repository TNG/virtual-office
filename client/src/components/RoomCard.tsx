import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";

const useStyles = makeStyles({
  root: {
    width: 350,
  },
  header: { height: 40 },
  content: {
    paddingTop: 0,
    paddingBottom: 4,
  },
  avatarGroup: {
    marginLeft: 8,
  },
});

const RoomCard = ({ room }: { room: RoomWithParticipants }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        avatar={room.icon ? <Avatar src={room.icon} /> : undefined}
        title={<Typography variant="h5">{room.name}</Typography>}
      />

      <CardContent className={classes.content}>
        {room.participants.length > 0 ? (
          <AvatarGroup className={classes.avatarGroup} max={5} spacing="medium">
            {room.participants.map(({ id, username, imageUrl }) => (
              <Tooltip key={id} title={username}>
                <Avatar alt={username} src={imageUrl} />
              </Tooltip>
            ))}
          </AvatarGroup>
        ) : (
          <Box height={44}>
            <Typography variant="caption">No one is here</Typography>
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button size="small" color="secondary" variant="text" href={room.joinUrl} target="_blank">
          Join
        </Button>
      </CardActions>
    </Card>
  );
};
export default RoomCard;
