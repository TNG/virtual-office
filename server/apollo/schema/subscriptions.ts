import { gql, withFilter } from "apollo-server-express";
import { pubSub } from "../ApolloPubSubService";

export const typeDefsSubscriptions = gql`
  type Subscription {
    participantMutated: ParticipantMutatedResponse!
    roomInGroupMutated(groupId: ID!): RoomInGroupMutatedResponse!
  }
`;

export const resolversSubscriptions = {
  Subscription: {
    participantMutated: {
      subscribe: withFilter(
        () => pubSub.asyncIterator(["PARTICIPANT_ADDED", "PARTICIPANT_REMOVED"]),
        (payload, variables) => payload.participantMutated.success && payload.groupId === variables.groupId
      ),
    },
    roomInGroupMutated: {
      subscribe: withFilter(
        () => pubSub.asyncIterator(["ROOM_IN_GROUP_ADDED", "ROOM_IN_GROUP_REMOVED"]),
        (payload, variables) => payload.roomInGroupMutated.success // && payload.groupId === variables.groupId
      ),
    },
  },
};
