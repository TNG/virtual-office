// @ts-nocheck

import { gql } from "apollo-server-express";
import { pubsub } from "../ApolloPubSubService";

export const typeDefsMutations = gql`
  type Mutation {
    addParticipantToMeeting(participant: ParticipantInput!, meetingId: ID!): ParticipantMutatedResponse!
    removeParticipantFromMeeting(participant: ParticipantInput!, meetingId: ID!): ParticipantMutatedResponse!
    updateOffice(officeInput: OfficeInput!): OfficeMutatedResponse!
    addRoomToGroup(roomInput: RoomInput!, groupId: ID!): RoomInGroupMutatedResponse!
    removeRoomFromGroup(roomId: ID!, groupId: ID!): RoomInGroupMutatedResponse!
  }

  enum MutationType {
    ADD
    REMOVE
    UPDATE
  }

  interface MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
  }

  type ParticipantMutatedResponse implements MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
    participant: Participant!
    meetingId: ID!
  }

  type OfficeMutatedResponse implements MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
    office: Office!
  }

  type RoomInGroupMutatedResponse implements MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
    room: Room
    groupId: ID!
  }
`;

export const resolversMutations = {
  MutationResponse: {
    __resolveType(response: MutationResponse) {
      return "MutationResponse";
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
};
