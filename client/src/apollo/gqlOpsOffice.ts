import { gql } from "@apollo/client";
import { BLOCK_FRAGMENT_COMPLETE } from "./gqlOpsBlock";

/** Fragments */
const OFFICE_FRAGMENT_SHORT = gql`
  fragment OfficeFragmentShort on Office {
    id
    version
    blocks {
      id
      isInSearch @client
    }
  }
`;

/** Queries */
export const GET_OFFICE_SHORT = gql`
  query getOffice {
    getOffice {
      ...OfficeFragmentShort
    }
  }
  ${OFFICE_FRAGMENT_SHORT}
`;

export const GET_OFFICE_COMPLETE = gql`
  query getOffice {
    getOffice {
      id
      version
      blocks {
        ...BlockFragmentComplete
      }
    }
  }
  ${BLOCK_FRAGMENT_COMPLETE}
`;
