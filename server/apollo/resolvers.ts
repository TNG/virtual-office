// @ts-nocheck

import { BlockApollo, SessionApollo } from "./ApolloTypes";
import { GroupApollo, RoomApollo } from "./TypesApollo";

import { withFilter } from "apollo-server-express";
import { pubsub } from "./ApolloPubSubService";

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
    getGroupJoinConfig: (_, { id }, { dataSources }) => {
      return dataSources.officeStore.getGroupJoinConfig(id);
    },
    getSession: (_, { id }, { dataSources }) => {
      return dataSources.officeStore.getSession(id);
    },
    getRoom: (_, { id }, { dataSources }) => {
      return dataSources.officeStore.getRoom(id);
    },
    getRoomLinks: (_, { ids }, { dataSources }) => {
      return dataSources.officeStore.getRoomLinks(ids);
    },
    getAllMeetings: (_, __, { dataSources }) => {
      return dataSources.participantsStore.getAllMeetings();
    },
    getParticipantsInMeeting: (_, { id }, { dataSources }) => {
      return dataSources.participantsStore.getParticipantsInMeeting(id);
    },
    getClientConfig: (_, { id }, { dataSources }) => {
      return dataSources.clientConfigStore.getClientConfig();
    },
  },
  Subscription: {
    participantMutated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["PARTICIPANT_ADDED", "PARTICIPANT_REMOVED"]),
        (payload, variables) => payload.meetingId === variables.meetingId
      ),
    },
    /*participantAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["PARTICIPANT_ADDED"]),
        (payload, variables) => payload.meetingId === variables.id
      ),
    },
    participantRemoved: {
      subscribe: () => pubsub.asyncIterator(["PARTICIPANT_REMOVED"]),
    },*/
  },
  Mutation: {
    addRoomToGroup: (_, { roomConfig, groupId }, { dataSources }) => {
      const {
        roomFromOfficeStore,
        groupFromOfficeStore,
      }: {
        roomFromOfficeStore: RoomApollo | undefined;
        groupFromOfficeStore: GroupApollo | undefined;
      } = dataSources.officeStore.addRoomToGroup(roomConfig, groupId);
      const success: boolean =
        !!roomFromOfficeStore &&
        !!groupFromOfficeStore &&
        groupFromOfficeStore?.rooms.some((room: RoomApollo) => room.id === roomFromOfficeStore.id);
      const message: string = success
        ? `Added room "${roomFromOfficeStore.name}" (ID=${roomFromOfficeStore.id}) to group "${groupFromOfficeStore.name}" (ID=${roomFromOfficeStore.id}).`
        : !groupFromOfficeStore
        ? `Error! Group with ID=${groupId} does not exist.`
        : !roomFromOfficeStore
        ? `Error! Room provided is not a valid room type.`
        : `Undefined Error!`;
      return {
        success: success,
        message: message,
        room: roomFromOfficeStore,
        group: groupFromOfficeStore,
      };
    },
    addParticipantToMeeting: (_, { participant, id }, { dataSources }) => {
      const success: boolean = dataSources.participantsStore.addParticipantToMeeting(participant, id);
      if (success) {
        pubsub.publish("PARTICIPANT_ADDED", {
          participantMutated: { mutationType: "PARTICIPANT_ADDED", participant: participant },
          meetingId: id,
        });
      }
      return {
        success: success,
        message: success ? "Successfully added participant!" : "Participant already in meeting!",
      };
    },
    removeParticipantFromMeeting: (_, { participant, id }, { dataSources }) => {
      const success: boolean = dataSources.participantsStore.removeParticipantFromMeeting(participant, id);
      if (success) {
        pubsub.publish("PARTICIPANT_REMOVED", {
          participantMutated: { mutationType: "PARTICIPANT_REMOVED", participant: participant },
          meetingId: id,
        });
      }
      return {
        success: success,
        message: success ? "Successfully removed participant!" : "Participant not in meeting!",
      };
    },
  },
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
  MutationResponse: {
    __resolveType(response: MutationResponse) {
      return "MutationResponse";
    },
  },
};
