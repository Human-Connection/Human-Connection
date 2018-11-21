import faker from 'faker'

export default () => {
  return `mutation {
    o1: CreateOrganization(
      id: "o1",
      name: "Democracy Deutschland",
      description: "Description for democracy-deutschland.",
      disabled: false,
      deleted: false
    ) { name }
    o2: CreateOrganization(
      id: "o2",
      name: "Human-Connection",
      description: "Description for human-connection.",
      disabled: false,
      deleted: false
    ) { name }
    o3: CreateOrganization(
      id: "o3",
      name: "Pro Veg",
      description: "Description for pro-veg.",
      disabled: false,
      deleted: false
    ) { name }
    o4: CreateOrganization(
      id: "o4",
      name: "Greenpeace",
      description: "Description for greenpeace.",
      disabled: false,
      deleted: false
    ) { name }

    u1_c_o1: AddOrganizationCreatedBy(
      from: { id: "u1" },
      to: { id: "o1" }
    ) { from { id } }
    u1_c_o2: AddOrganizationCreatedBy(
      from: { id: "u1" },
      to: { id: "o2" }
    ) { from { id } }

    u2_o_o1: AddOrganizationOwnedBy(
      from: { id: "u2" },
      to: { id: "o2" }
    ) { from { id } }
    u2_c_o3: AddOrganizationOwnedBy(
      from: { id: "u2" },
      to: { id: "o3" }
    ) { from { id } }
  }
`
}
