// @ts-nocheck

import { BlockApollo, SessionApollo } from "./ApolloTypes";

export const resolvers = {
  Query: {
    getOffice: (_, __, { dataSources }) => {
      return dataSources.officeStore.getOffice();
    },
    getBlock: (_, { id }, { dataSources }) => {
      return dataSources.officeStore.getBlock(id);
    },
    getGroup: (_, { id }, { dataSources }) => {
      return dataSources.officeStore.getGroup(id);
    },
    getSession: (_, { id }, { dataSources }) => {
      return dataSources.officeStore.getSession(id);
    },
    getRoom: (_, { id }, { dataSources }) => {
      return dataSources.officeStore.getRoom(id);
    },
  },
  /*Mutation: {
    addRoomToGroup: (_, { roomInput, groupName }, { dataSources }) => {
      const groupFromOffice = dataSources.officeStore.addRoomToGroup(roomInput, groupName);
      const success: boolean = !!groupFromOffice;
      const message: string = success
        ? `Added room \"${roomInput.name}\" to group \"${groupFromOffice.name}\".`
        : `Error! Group \"${groupName}\" does not exist.`;
      return {
        success: success,
        message: message,
        room: roomInput,
        group: groupFromOffice,
      };
    },
  },*/
  Block: {
    __resolveType(block: BlockApollo) {
      if (block.type === "GROUP_BLOCK") {
        return "GroupBlock";
      } else if (block.type === "SCHEDULE_BLOCK") {
        return "ScheduleBlock";
      } else if (block.type === "SESSION_BLOCK") {
        return "SessionBlock";
      } else {
        return null;
      }
    },
  },
  Session: {
    __resolveType(session: SessionApollo) {
      if (session.type === "GROUP_SESSION") {
        return "GroupSession";
      } else if (session.type === "ROOM_SESSION") {
        return "RoomSession";
      } else {
        return null;
      }
    },
  },
};
