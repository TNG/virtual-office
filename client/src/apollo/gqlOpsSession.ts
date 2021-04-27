import { gql } from "@apollo/client";
import { GROUP_FRAGMENT_COMPLETE } from "./gqlOpsGroup";
import { ROOM_FRAGMENT_COMPLETE } from "./gqlOpsRoom";

/** Fragments */
export const SESSION_FRAGMENT_SHORT = gql`
  fragment SessionFragmentShort on Session {
    id
    type
    start
    end
    trackName
    isInSearch @client
    ... on GroupSession {
      group {
        id
      }
    }
    ... on RoomSession {
      room {
        id
      }
    }
  }
`;

export const SESSION_FRAGMENT_COMPLETE = gql`
  fragment SessionFragmentComplete on Session {
    id
    type
    start
    end
    trackName
    ... on GroupSession {
      group {
        ...GroupFragmentComplete
      }
    }
    ... on RoomSession {
      room {
        ...RoomFragmentComplete
      }
    }
  }
  ${GROUP_FRAGMENT_COMPLETE}
  ${ROOM_FRAGMENT_COMPLETE}
`;

export const SESSION_SEARCH_FRAGMENT = gql`
  fragment SessionSearchFragment on Session {
    isInSearch @client
  }
`;

/** Queries */
export const GET_SESSION_SHORT = gql`
  query getSession($id: ID!) {
    getSession(id: $id) {
      ...SessionFragmentShort
    }
  }
  ${SESSION_FRAGMENT_SHORT}
`;
