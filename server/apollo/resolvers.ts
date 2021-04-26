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
        (payload, variables) => payload.participantMutated.success && payload.groupId === variables.groupId
      ),
    },
    roomInGroupMutated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["ROOM_IN_GROUP_ADDED", "ROOM_IN_GROUP_REMOVED"]),
        (payload, variables) => payload.roomInGroupMutated.success // && payload.groupId === variables.groupId
      ),
    },
  },
  Mutation: {
    addParticipantToMeeting: (_, { participant, meetingId }, { dataSources }) => {
      const success: boolean = dataSources.participantsStore.addParticipantToMeeting(participant, meetingId);

      const mutationResponse = {
        success: success,
        message: success ? "Successfully added participant!" : "Participant already in meeting!",
        mutationType: "ADD",
        participant: participant,
        meetingId: meetingId,
      };

      if (success) {
        pubsub.publish("PARTICIPANT_ADDED", { participantMutated: mutationResponse });
      }
      return mutationResponse;
    },
    removeParticipantFromMeeting: (_, { participant, meetingId }, { dataSources }) => {
      const success: boolean = dataSources.participantsStore.removeParticipantFromMeeting(participant, meetingId);

      const mutationResponse = {
        success: success,
        message: success ? "Successfully removed participant!" : "Participant not in meeting!",
        mutationType: "REMOVE",
        participant: participant,
        meetingId: meetingId,
      };

      if (success) {
        pubsub.publish("PARTICIPANT_REMOVED", { participantMutated: mutationResponse });
      }
      return mutationResponse;
    },
    updateOffice: (_, { officeInput }, { dataSources }) => {
      const success: boolean = dataSources.officeStore.updateOffice(officeInput);

      const mutationResponse = {
        success: success,
        message: success ? "Successfully updated office!" : "Some error occured!",
        mutationType: "UPDATE",
        office: dataSources.officeStore.getOffice(),
      };

      return mutationResponse;
    },
    addRoomToGroup: (_, { roomInput, groupId }, { dataSources }) => {
      const { success, room } = dataSources.officeStore.addRoomToGroup(roomInput, groupId);

      const mutationResponse = {
        success: success,
        message: success ? "Successfully added room to group!" : "GroupId not existing!",
        mutationType: "ADD",
        room: room,
        groupId: groupId,
      };

      if (success) {
        pubsub.publish("ROOM_IN_GROUP_ADDED", { roomInGroupMutated: mutationResponse });
      }
      return mutationResponse;
    },
    removeRoomFromGroup: (_, { roomId, groupId }, { dataSources }) => {
      const room: RoomApollo = dataSources.officeStore.getRoom(roomId);
      const success: boolean = dataSources.officeStore.removeRoomFromGroup(roomId, groupId);

      const mutationResponse = {
        success: success,
        message: success ? "Successfully removed room from group!" : "Room or group not existing or room not in group!",
        mutationType: "REMOVE",
        room: room,
        groupId: groupId,
      };

      if (success) {
        pubsub.publish("ROOM_IN_GROUP_REMOVED", { roomInGroupMutated: mutationResponse });
      }
      return mutationResponse;
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
