// @ts-nocheck

import { gql } from "apollo-server-express";

export const typeDefsQueries = gql`
  type Query {
    getOffice: Office
    getBlock(id: ID!): Block
    getGroup(id: ID!): Group
    getGroupJoinConfig(id: ID!): GroupJoinConfig
    getSession(id: ID!): Session
    getRoom(id: ID!): Room
    getRoomLinks(ids: [ID!]!): [RoomLink!]!
    getAllMeetings: [Meeting!]!
    getParticipantsInMeeting(id: ID!): [Participant!]!
    getClientConfig: ClientConfig!
  }
`;

export const resolversQueries = {
  Query: {
    getOffice: (_, __, { dataSources }) => {
      return dataSources.officeStore.getOffice();
    },
    getBlock: (_, { id }, { dataSources }) => {
      return dataSources.blockStore.getBlock(id);
    },
    getGroup: (_, { id }, { dataSources }) => {
      return dataSources.groupStore.getGroup(id);
    },
    getGroupJoinConfig: (_, { id }, { dataSources }) => {
      return dataSources.groupStore.getGroupJoinConfig(id);
    },
    getSession: (_, { id }, { dataSources }) => {
      return dataSources.sessionStore.getSession(id);
    },
    getRoom: (_, { id }, { dataSources }) => {
      return dataSources.roomStore.getRoom(id);
    },
    getRoomLinks: (_, { ids }, { dataSources }) => {
      return dataSources.roomStore.getRoomLinks(ids);
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
};
