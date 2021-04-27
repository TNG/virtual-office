import { gql } from "@apollo/client";
import { SESSION_FRAGMENT_COMPLETE, SESSION_FRAGMENT_SHORT } from "./gqlOpsSession";
import { GROUP_FRAGMENT_COMPLETE } from "./gqlOpsGroup";

/** Fragments */
const BLOCK_FRAGMENT_SHORT = gql`
  fragment BlockFragmentShort on Block {
    id
    type
    name
    ... on GroupBlock {
      group {
        id
        isInSearch @client
      }
    }
    ... on ScheduleBlock {
      sessions {
        ...SessionFragmentShort
      }
      tracks {
        id
        name
      }
    }
    ... on SessionBlock {
      title
      sessions {
        ...SessionFragmentShort
      }
    }
  }
  ${SESSION_FRAGMENT_SHORT}
`;

export const BLOCK_FRAGMENT_COMPLETE = gql`
  fragment BlockFragmentComplete on Block {
    id
    type
    name
    ... on GroupBlock {
      group {
        ...GroupFragmentComplete
      }
    }
    ... on ScheduleBlock {
      sessions {
        ...SessionFragmentComplete
      }
      tracks {
        id
        name
      }
    }
    ... on SessionBlock {
      title
      sessions {
        ...SessionFragmentComplete
      }
    }
  }
  ${GROUP_FRAGMENT_COMPLETE}
  ${SESSION_FRAGMENT_COMPLETE}
`;

export const BLOCK_SEARCH_FRAGMENT = gql`
  fragment BlockSearchFragment on Block {
    isInSearch @client
  }
`;

/** Queries */
export const GET_BLOCK_SHORT = gql`
  query getBlock($id: ID!) {
    getBlock(id: $id) {
      ...BlockFragmentShort
    }
  }
  ${BLOCK_FRAGMENT_SHORT}
`;
