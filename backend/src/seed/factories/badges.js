import uuid from 'uuid/v4'

export default function(params) {
  const {
    id = uuid(),
    key = '',
    type = 'crowdfunding',
    status = 'permanent',
    icon = '/img/badges/indiegogo_en_panda.svg',
  } = params

  return {
    mutation: `
      mutation(
        $id: ID
        $key: String!
        $type: BadgeTypeEnum!
        $status: BadgeStatusEnum!
        $icon: String!
      ) {
        CreateBadge(id: $id, key: $key, type: $type, status: $status, icon: $icon) {
          id
        }
      }
    `,
    variables: { id, key, type, status, icon },
  }
}
