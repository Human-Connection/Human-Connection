import { throwError, of, concat } from 'rxjs'
import { tap, flatMap, mergeMap, map, catchError, filter } from 'rxjs/operators'
import CONFIG from '../src/config'
import { getNeode, getDriver } from '../src/bootstrap/neo4j'
import normalizeEmail from '../src/schema/resolvers//helpers/normalizeEmail'


export function up (next) {
  const driver = getDriver()
  const rxSession = driver.rxSession()
  rxSession
    .beginTransaction()
    .pipe(
      flatMap(txc =>
        concat(
          txc
          .run("MATCH (email:EmailAddress) RETURN email {.email}")
          .records()
          .pipe(
            map(record => {
              const { email } = record.get('email')
              const normalizedEmail = normalizeEmail(email)
              return { email, normalizedEmail }
            }),
            filter(({email, normalizedEmail}) => email !== normalizedEmail),
            mergeMap(({email, normalizedEmail})=> {
              return txc
                .run(`
                  MATCH (oldUser:User)-[:PRIMARY_EMAIL]->(oldEmail:EmailAddress {email: $email}), (oldUser)-[previousRelationship]-(oldEmail)
                  MATCH (user:User)-[:PRIMARY_EMAIL]->(email:EmailAddress {email: $normalizedEmail})
                  DELETE previousRelationship
                  WITH oldUser, oldEmail, user, email
                  CALL apoc.refactor.mergeNodes([user, oldUser], { properties: 'discard', mergeRels: true }) YIELD node as mergedUser
                  CALL apoc.refactor.mergeNodes([email, oldEmail], { properties: 'discard', mergeRels: true }) YIELD node as mergedEmail
                  RETURN user {.*}, email {.*}
              `, { email, normalizedEmail })
                .records()
                .pipe(
                  map(r => ({
                    oldEmail: email,
                    email: r.get('email'),
                    user: r.get('user'),
                  }))
                )
            }),
          ),
          txc.commit(),
        ).pipe(catchError(err => txc.rollback().pipe(throwError(err))))
      )
    )
    .subscribe({
      next: ({ user, email, oldUser, oldEmail }) => console.log(`
    Merged:
    =============================
    userId: ${user.id}
    email: ${oldEmail} => ${email.email}
    =============================
    `),
      complete: () => {
        console.log('Merging of duplicate users completed')
        next()
      },
      error: error => throw new Error(error)
    })
}

export function down () {
  throw new Error("Irreversible migration")
}
