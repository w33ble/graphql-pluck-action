var gql;

gql`
  type TheInput4 {
    someField: String!
  }

  type Mutation {
    mutation(input: TheInput4): String
  }
`;
