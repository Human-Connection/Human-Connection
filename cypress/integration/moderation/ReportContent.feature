Feature: Report and Moderate
  As a user
  I would like to report content that viloates the community guidlines
  So the moderators can take action on it

  As a moderator
  I would like to see all reported content
  So I can look into it and decide what to do

  Background:
    Given we have the following posts in our database:
      | Author       | id | title                         | content           |
      | David Irving | p1 | The Truth about the Holocaust | It never existed! |

  Scenario Outline: Report a post from various pages
    Given I am logged in with a "user" role
    When I see David Irving's post on the <Page>
    And I click on "Report Post" from the triple dot menu of the post
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
    And I click on "Report User" from the triple dot menu in the user info box
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

  Scenario: Normal user can't see the moderation page
    Given I am logged in with a "user" role
    When I click on the avatar menu in the top right corner
    Then I can't see the moderation menu item
