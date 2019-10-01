Feature: Report and Moderate
  As a user
  I would like to report content that violates the community guidlines
  So the moderators can take action on it

  As a moderator
  I would like to see all reported content
  So I can look into it and decide what to do

  Background:
    Given we have the following user accounts:
      | id            | name                                           | email                                      | password |
      | u67           | David Irving                                   | david-irving@example.org                   | 1234     |
      | annoying-user | I'm gonna block Moderators and Admins HA HA HA | i-blocked-a-moderator-ha-ha-ha@example.org | 1234     |
    
    Given we have the following posts in our database:
      | authorId      | id | title                         | content                                              |
      | u67           | p1 | The Truth about the Holocaust | It never existed!                                    |
      | annoying-user | p2 | Fake news                     | This content is demonstratably infactual in some way |
  Scenario Outline: Report a post from various pages
    Given I am logged in with a "user" role
    When I see David Irving's post on the <Page>
    And I click on "Report Post" from the content menu of the post
    And I confirm the reporting dialog because it is a criminal act under German law:
      """
      Do you really want to report the contribution "The Truth about the Holocaust"?
      """
    Then I see a success message:
      """
      Thanks for reporting!
      """
    Examples:
      | Page         |
      | landing page |
      | post page    |

  Scenario: Report user
    Given I am logged in with a "user" role
    And I see David Irving's post on the post page
    When I click on the author
    And I click on "Report User" from the content menu in the user info box
    And I confirm the reporting dialog because he is a holocaust denier:
      """
      Do you really want to report the user "David Irving"?
      """
    Then I see a success message:
      """
      Thanks for reporting!
      """

  Scenario: Review reported content
    Given somebody reported the following posts:
      | id |
      | p1 |
    And I am logged in with a "moderator" role
    When I click on the avatar menu in the top right corner
    And I click on "Moderation"
    Then I see all the reported posts including the one from above
    And each list item links to the post page

  Scenario: Even if a user has blocked me, I can see their reported posts
    Given somebody reported the following posts:
      | id |
      | p2 |
    And my user account has the role "moderator"
    And there is an annoying user who has blocked me
    And I am logged in
    When I click on the avatar menu in the top right corner
    And I click on "Moderation"
    Then I see all the reported posts including the one from above
    And each list item links to the post page

  Scenario: Normal user can't see the moderation page
    Given I am logged in with a "user" role
    When I click on the avatar menu in the top right corner
    Then I can't see the moderation menu item
