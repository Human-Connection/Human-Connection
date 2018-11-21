export default function (data) {
  return `
    mutation {
      cat1: CreateCategory( id: "cat1", name: "Just For Fun", slug: "justforfun", icon: "categories-justforfun" ) { name }
      cat2: CreateCategory( id: "cat2", name: "Happyness & Values", slug: "happyness-values", icon: "categories-luck" ) { name }
      cat3: CreateCategory( id: "cat3", name: "Health & Wellbeing", slug: "health-wellbeing", icon: "categories-health" ) { name }
      cat4: CreateCategory( id: "cat4", name: "Environment & Nature", slug: "environment-nature", icon: "categories-environment" ) { name }
      cat5: CreateCategory( id: "cat5", name: "Animal Protection", slug: "animalprotection", icon: "categories-animal-justice" ) { name }
      cat6: CreateCategory( id: "cat6", name: "Humanrights Justice", slug: "humanrights-justice", icon: "categories-human-rights" ) { name }
      cat7: CreateCategory( id: "cat7", name: "Education & Sciences", slug: "education-sciences", icon: "categories-education" ) { name }
      cat8: CreateCategory( id: "cat8", name: "Cooperation & Development", slug: "cooperation-development", icon: "categories-cooperation" ) { name }
      cat9: CreateCategory( id: "cat9", name: "Democracy & Politics", slug: "democracy-politics", icon: "categories-politics" ) { name }
      cat10: CreateCategory( id: "cat10", name: "Economy & Finances", slug: "economy-finances", icon: "categories-economy" ) { name }
      cat11: CreateCategory( id: "cat11", name: "Energy & Technology", slug: "energy-technology", icon: "categories-technology" ) { name }
      cat12: CreateCategory( id: "cat12", name: "IT, Internet & Data Privacy", slug: "it-internet-dataprivacy", icon: "categories-internet" ) { name }
      cat13: CreateCategory( id: "cat13", name: "Art, Curlure & Sport", slug: "art-culture-sport", icon: "categories-art" ) { name }
      cat14: CreateCategory( id: "cat14", name: "Freedom of Speech", slug: "freedomofspeech", icon: "categories-freedom-of-speech" ) { name }
      cat15: CreateCategory( id: "cat15", name: "Consumption & Sustainability", slug: "consumption-sustainability", icon: "categories-sustainability" ) { name }
      cat16: CreateCategory( id: "cat16", name: "Global Peace & Nonviolence", slug: "globalpeace-nonviolence", icon: "categories-peace" ) { name }
    }
  `
}
