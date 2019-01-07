Feature: About me and and location
  As a user
  I would like to add some about me text and a location
  So others can get some info about me and my location

  The location and about me are show on the user. Later it will be possible
  to search for users by location.

  Background:
    Given I am logged in

  Scenario: I change my name
    When I visit the "settings" page
    And I enter "Hansi" as my name
    And I press "Save"
    And I can click on my profile picture in the top right corner
    Then I can see a "Hansi" as my name

    When I refresh the page
    And I can click on my profile picture in the top right corner
    Then I can see a "Hansi" as my name

    When I visit the "settings" page
    And I enter "Peter Lustig" as my name
    And I press "Save"

  Scenario: I set my location
    When I visit the "settings" page
    And I enter "Hamburg" as my location
    And I press "Save"
    And I visit the "profile/peter-lustig" page
    Then I can see a "Hamburg" as my location

  Scenario: I write about me
    When I visit the "settings" page
    And I enter "Some text about me" to about me
    And I press "Save"
    And I visit the "profile/peter-lustig" page
    Then I can see a "Some text about me" as my about me



