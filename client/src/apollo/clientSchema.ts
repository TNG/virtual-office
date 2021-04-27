import { gql } from "@apollo/client/core";

export const clientTypeDefs = gql`
  directive @client on FIELD

  extend type Group {
    isInSearch: Boolean
  }

  extend type Room {
    isInSearch: Boolean
  }
`;
