import React from "react";
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
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";
import theme from "../theme";

const useStyles = makeStyles<typeof theme>((theme) => ({
  root: {
    margin: 8,
    padding: 0,
    width: "90%",
    minWidth: 260,
    maxWidth: 320,
    flex: "0 0 auto",
    [theme.breakpoints.up("sm")]: {
      width: 320,
    },
  },
  header: { height: 40 },
  content: {
    paddingTop: 0,
    paddingBottom: 4,
  },
  avatarGroup: {
    marginLeft: 8,
  },
}));

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
