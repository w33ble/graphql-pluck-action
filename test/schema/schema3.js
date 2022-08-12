var gql;

gql`
  type TheInput3 {
    someField: String!
  }

  type Query {
    query3(input: TheInput3): String
  }
`;
