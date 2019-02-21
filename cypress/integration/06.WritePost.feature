Feature: Create a post
  As a user
  I would like to create a post
  To say something to everyone in the community

  Background:
    Given I am logged in
    And I am on the "landing" page

  Scenario: Create a post
    When I click on the big plus icon in the bottom right corner to create post
    And I choose "My first post" as the title of the post
    And I type in the following text:
    """
    Human Connection is a free and open-source social network
    for active citizenship.
    """
    And I click on "Save"
    Then I get redirected to "/post/my-first-post/"
    And the post was saved successfully

  Scenario: See a post on the landing page
    Given I previously created a post
    Then the post shows up on the landing page at position 1
