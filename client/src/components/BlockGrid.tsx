import React from "react";
import { Block } from "../../../server/express/types/Office";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { GroupBlockGrid } from "./GroupBlockGrid";
import { ScheduleBlockGrid } from "./ScheduleBlockGrid";
import { ClientConfig } from "../../../server/express/types/ClientConfig";

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
  clientConfig: ClientConfig;
}

/** Component */
export const BlockGrid = (props: Props) => {
  const { block, clientConfig } = props;
  const classes = useStyles(props);

  return (
    <div className={classes.root}>
      {renderBlockHeader()}
      <div>
        {block.type === "GROUP_BLOCK" ? (
          <GroupBlockGrid group={block.group} isDisabled={false} isJoinable={true} isListMode={false} />
        ) : (
          <ScheduleBlockGrid tracks={block.tracks} sessions={block.sessions} clientConfig={clientConfig} />
        )}
      </div>
    </div>
  );

  function renderBlockHeader() {
    return block.name && <h2 className={classes.title}>{block.name}</h2>;
  }
};
