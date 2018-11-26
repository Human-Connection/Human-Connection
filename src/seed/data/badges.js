export default function (data) {
  return `
    mutation {
      b1: CreateBadge(id: "b1", key: "indiegogo_en_racoon", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_racoon.svg") { id }
      b2: CreateBadge(id: "b2", key: "indiegogo_en_rabbit", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_rabbit.svg") { id }
      b3: CreateBadge(id: "b3", key: "indiegogo_en_wolf", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_wolf.svg") { id }
      b4: CreateBadge(id: "b4", key: "indiegogo_en_bear", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_bear.svg") { id }
      b5: CreateBadge(id: "b5", key: "indiegogo_en_turtle", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_turtle.svg") { id }
      b6: CreateBadge(id: "b6", key: "indiegogo_en_rhino", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_rhino.svg") { id }
    }
  `
}
