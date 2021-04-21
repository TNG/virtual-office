import React from "react";
import { makeStyles } from "@material-ui/styles";
import { fade, Theme } from "@material-ui/core";
import { GroupBlockGrid } from "./GroupBlockGrid";
import { ScheduleBlockGrid } from "./ScheduleBlockGrid";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { SessionBlockGrid } from "./SessionBlockGrid";
import { useQuery } from "@apollo/client";
import { GET_BLOCK_SHORT } from "../apollo/gqlQueries";

/** Styles */
const useStyles = makeStyles<Theme, Props>((theme) => ({
  block: {
    backgroundColor: fade(theme.palette.common.white, 0.3),
    borderRadius: theme.shape.borderRadius,
  },
  title: {
    color: "#fff",
    margin: 12,
    marginTop: 24,
    padding: 0,
  },
}));

/** Props */
interface Props {
  id: string;
}

/** Component */
export const BlockGrid = (props: Props) => {
  const { id } = props;
  const classes = useStyles(props);

  const { data, loading, error } = useQuery(GET_BLOCK_SHORT, { variables: { id } });

  if (!data) return null;

  return (
    <div className={classes.root}>
      {renderBlockHeader()}
      <div className={classes.block}>{renderBlock()}</div>
    </div>
  );

  function renderBlockHeader() {
    const blockHeader = data.getBlock.name;
    return <h2 className={classes.title}>{blockHeader}</h2>;
  }

  function renderBlock() {
    if (data.getBlock.type === "GROUP_BLOCK") {
      return data.getBlock.group.isInSearch && <GroupBlockGrid id={data.getBlock.group.id} isActive={true} />;
    } else if (data.getBlock.type === "SCHEDULE_BLOCK") {
      return <ScheduleBlockGrid id={data.getBlock.id} />;
    } else if (data.getBlock.type === "SESSION_BLOCK") {
      return <SessionBlockGrid id={data.getBlock.id} />;
    }
  }
};
