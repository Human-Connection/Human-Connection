Feature: Report content
  As a user
  I would like to report content that viloates the community guidlines
  So the moderators can take action on it

  As a moderator
  I would like to see all reported content
  So I can look into it and decide what to do

  Scenario: Report a Post from landingpage
    Given I am logged in as "user"
    And I am on the "landing" page

    When I click on a Post menu and select the report option
    And I click on send in the confirmation dialog
    Then I get a success message

  Scenario: See reported content
    Given I am logged in as "moderator"
    And I previously reported a post

    When I am on the "moderation" page
    Then I see my reported post

  Scenario: Report while reading Post
    Given I am logged in as "admin"
    And I am viewing a post

    When I report the current post
    And I visit the "moderation" page
    Then I see my reported post

  #Scenario: Normal user can't see the moderation page
    #Given I am logged in as "user"
