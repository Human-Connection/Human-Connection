Feature: Internationalization
  As a user who is not very fluent in English
  I would like to see the user interface translated to my preferred language
  In order to be able to understand the interface

  Background:
    When I visit the "login" page

  Scenario: Change the language
    When I select "Deutsch" in the language menu
    Then The whole user interface appears in "Deutsch"

    When I select "Français" in the language menu
    Then The whole user interface appears in "Français"

    When I select "English" in the language menu
    Then The whole user interface appears in "English"

  Scenario: Keep preferred language after refresh
    When I select "Deutsch" in the language menu
    Then The whole user interface appears in "Deutsch"

    And I refresh the page
    Then The whole user interface appears in "Deutsch"
