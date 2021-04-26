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
};
