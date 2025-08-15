import { gql } from "@apollo/client";

export const PERSON_DETAILS = gql`
  fragment PersonDetails on Person {
    name
    phone
    address {
      street
      city
    }
    id
  }
`;

export const GET_ALL_PERSONS = gql`
  query {
    allPersons {
      ...PersonDetails
    }
  }
  ${PERSON_DETAILS}
`;

export const FIND_PERSON = gql`
  query findPerson($name: String!) {
    findPerson(name: $name) {
      ...PersonDetails
    }
  }
  ${PERSON_DETAILS}
`;

export const PERSON_ADDED = gql`
  subscription {
    personAdded {
      ...PersonDetails
    }
  }
  ${PERSON_DETAILS}
`;
