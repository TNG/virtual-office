import React from "react";
import { Block } from "../../../server/express/types/Office";
import { makeStyles } from "@material-ui/styles";
import { fade, Theme } from "@material-ui/core";
import { GroupBlockGrid } from "./GroupBlockGrid";
import { ScheduleBlockGrid } from "./ScheduleBlockGrid";
import { ClientConfig } from "../../../server/express/types/ClientConfig";
import { MeetingsIndexed } from "./MeetingsIndexed";
import { SessionBlockGrid } from "./SessionBlockGrid";

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
  block: Block;
  clientConfig: ClientConfig;
  meetings: MeetingsIndexed;
}

/** Component */
export const BlockGrid = (props: Props) => {
  const { block, clientConfig, meetings } = props;
  const classes = useStyles(props);

  return (
    <div className={classes.root}>
      {renderBlockHeader()}
      <div className={classes.block}>{renderBlock()}</div>
    </div>
  );

  function renderBlockHeader() {
    const blockHeader = block.name;
    return <h2 className={classes.title}>{blockHeader}</h2>;
  }

  function renderBlock() {
    if (block.type === "GROUP_BLOCK") {
      return (
        <GroupBlockGrid
          group={block.group}
          isActive={true}
          isListMode={clientConfig.viewMode === "list"}
          meetings={meetings}
        />
      );
    } else if (block.type === "SCHEDULE_BLOCK") {
      return (
        <ScheduleBlockGrid
          tracks={block.tracks}
          sessions={block.sessions}
          clientConfig={clientConfig}
          meetings={meetings}
        />
      );
    } else if (block.type === "SESSION_BLOCK") {
      return (
        <SessionBlockGrid
          title={block.title}
          description={block.description}
          sessions={block.sessions}
          isListMode={clientConfig.viewMode === "list"}
          clientConfig={clientConfig}
          meetings={meetings}
        />
      );
    }
  }
};
