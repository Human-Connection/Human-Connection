Feature: Internationalization
  As a user
  I want users to get the site in my native language
  In order to be able to understand the interface

  Scenario: See english loginpage
    When I visit the "/login" page
    Then I can see the english language flag

  Scenario: See german loginpage
    When I visit the "/login" page
    And I click on the locale switch
    Then I can see the german language flag
    Then There should be a locale cooke set to de
    When I refresh the page
    Then I can see the german language flag
