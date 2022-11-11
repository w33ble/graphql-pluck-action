var gql;

gql`
  type TheInput1 {
    someField: String!
  }

  type Query {
    query1(input: TheInput1): String
  }
`;
