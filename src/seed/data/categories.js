export default function (data) {
  return `
    mutation {
      cat1: CreateCategory( id: "cat1", name: "Just For Fun", slug: "justforfun", icon: "smile" ) { name }
      cat2: CreateCategory( id: "cat2", name: "Happyness & Values", slug: "happyness-values", icon: "heart-o" ) { name }
      cat3: CreateCategory( id: "cat3", name: "Health & Wellbeing", slug: "health-wellbeing", icon: "medkit" ) { name }
      cat4: CreateCategory( id: "cat4", name: "Environment & Nature", slug: "environment-nature", icon: "tree" ) { name }
      cat5: CreateCategory( id: "cat5", name: "Animal Protection", slug: "animalprotection", icon: "paw" ) { name }
      cat6: CreateCategory( id: "cat6", name: "Humanrights Justice", slug: "humanrights-justice", icon: "balance-scale" ) { name }
      cat7: CreateCategory( id: "cat7", name: "Education & Sciences", slug: "education-sciences", icon: "graduation-cap" ) { name }
      cat8: CreateCategory( id: "cat8", name: "Cooperation & Development", slug: "cooperation-development", icon: "users" ) { name }
      cat9: CreateCategory( id: "cat9", name: "Democracy & Politics", slug: "democracy-politics", icon: "university" ) { name }
      cat10: CreateCategory( id: "cat10", name: "Economy & Finances", slug: "economy-finances", icon: "money" ) { name }
      cat11: CreateCategory( id: "cat11", name: "Energy & Technology", slug: "energy-technology", icon: "flash" ) { name }
      cat12: CreateCategory( id: "cat12", name: "IT, Internet & Data Privacy", slug: "it-internet-dataprivacy", icon: "mouse-pointer" ) { name }
      cat13: CreateCategory( id: "cat13", name: "Art, Curlure & Sport", slug: "art-culture-sport", icon: "paint-brush" ) { name }
      cat14: CreateCategory( id: "cat14", name: "Freedom of Speech", slug: "freedomofspeech", icon: "bullhorn" ) { name }
      cat15: CreateCategory( id: "cat15", name: "Consumption & Sustainability", slug: "consumption-sustainability", icon: "shopping-cart" ) { name }
      cat16: CreateCategory( id: "cat16", name: "Global Peace & Nonviolence", slug: "globalpeace-nonviolence", icon: "angellist" ) { name }
    }
  `
}
