Feature: Post Comment
  As a user
  I want to comment on contributions of others
  To be able to express my thoughts and emotions about these, discuss, and add give further information.

  Background:
    Given we have the following posts in our database:
      | id         | title                                         | slug       |
      | bWBjpkTKZp | 101 Essays that will change the way you think | 101-essays |
    And I have a user account
    And I am logged in

  Scenario:
    Given I visit "post/bWBjpkTKZp/101-essays"
    Then I should be able to post a comment
    And I should see my comment