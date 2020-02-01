Feature: Pin a post
  As an admin
  I want to pin a post so that it always appears at the top
  In order to make sure all network users read it - e.g. notify people about security incidents, maintenance downtimes


  Background:
    Given we have the following posts in our database:
      | id | title                       | pinned | createdAt  |
      | p1 | Some other post             |        | 2020-01-21 |
      | p2 | Houston we have a problem   | x      | 2020-01-20 |
      | p3 | Yet another post            |        | 2020-01-19 |

  Scenario: Pinned post always appears on the top of the newsfeed
    Given I am logged in with a "user" role
    Then the first post on the landing page has the title:
      """
      Houston we have a problem
      """
    And the post with title "Houston we have a problem" has a ribbon for pinned posts

  Scenario: Ordinary users cannot pin a post
    Given I am logged in with a "user" role
    When I open the content menu of post "Yet another post"
    Then there is no button to pin a post

  Scenario: Admins are allowed to pin a post
    Given I am logged in with a "admin" role
    And I open the content menu of post "Yet another post"
    When I click on 'Pin post'
    Then I see a toaster with "Post pinned successfully"
    And the first post on the landing page has the title:
      """
      Yet another post
      """
    And the post with title "Yet another post" has a ribbon for pinned posts
