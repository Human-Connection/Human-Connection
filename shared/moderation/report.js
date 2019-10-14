export const reportReasonCategoriesDatabaseList = () => {
    // list see "ReasonCategory" in backend GraphQL schema file "REPORTED.gql"
    return [
      'other', // element # zero, because it is the nutral one
      'discrimination-etc',
      'pornographic-content-links',
      'glorific-trivia-of-cruel-inhuman-acts',
      'doxing',
      'intentional-intimidation-stalking-persecution',
      'advert-products-services-commercial',
      'criminal-behavior-violation-german-law',
    ]
}
