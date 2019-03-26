Feature: Persistent Links
  As a user
  I want all links to carry permanent information that identifies the linked resource
  In order to have persistent links even if a part of the URL might change

  |      | Modifiable | Referenceable | Unique | Purpose                       |
  | --   | --         | --            | --     | --                            |
  | ID   | no         | yes           | yes    | Identity, Traceability, Links |
  | Slug | yes        | yes           | yes    | @-Mentions, SEO-friendly URL  |
  | Name | yes        | no            | no     | Search, self-description      |


  Background:
    Given we have the following user accounts:
      | id         | name            | slug    |
      | MHNqce98y1 | Stephen Hawking | thehawk |
    And we have the following posts in our database:
      | id         | title                                         | slug       |
      | bWBjpkTKZp | 101 Essays that will change the way you think | 101-essays |
    And I have a user account
    And I am logged in

  Scenario Outline: Link with slug only is valid and gets auto-completed
    When I visit "<url>"
    Then I get redirected to "<redirectUrl>"
    Examples:
      | url              | redirectUrl                 |
      | /profile/thehawk | /profile/MHNqce98y1/thehawk |
      | /post/101-essays | /post/bWBjpkTKZp/101-essays |

  Scenario: Link with id only will always point to the same user
    When I visit "/profile/MHNqce98y1"
    Then I get redirected to "/profile/MHNqce98y1/thehawk"

  Scenario Outline: ID takes precedence over slug
    When I visit "<url>"
    Then I get redirected to "<redirectUrl>"
    Examples:
      | url                                 | redirectUrl                 |
      | /profile/MHNqce98y1/stephen-hawking | /profile/MHNqce98y1/thehawk |
      | /post/bWBjpkTKZp/the-way-you-think  | /post/bWBjpkTKZp/101-essays |
