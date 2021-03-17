import React from "react";
import { Block } from "../../../server/express/types/Office";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { GroupBlockGrid } from "./GroupBlockGrid";

/** Styles */
const useStyles = makeStyles<Theme, Props>(() => ({
  title: {
    color: "#fff",
    margin: 12,
    marginTop: 24,
    padding: 0,
  },
}));

/** Props */
interface Props {
  block: Block;
}

/** Component */
export const BlockGrid = (props: Props) => {
  const { block } = props;
  const classes = useStyles(props);

  return (
    <div className={classes.root}>
      {renderBlockHeader()}
      <div>{block.type === "GROUP_BLOCK" ? <GroupBlockGrid group={block.group} /> : "renderScheduleBlock"}</div>
    </div>
  );

  function renderBlockHeader() {
    return block.name && <h2 className={classes.title}>{block.name}</h2>;
  }
};
