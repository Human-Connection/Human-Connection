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

  Scenario: Comment creation
    Given I visit "post/bWBjpkTKZp/101-essays"
    And I type in the following text:
    """
    Human Connection rocks
    """
    And I click on the "Comment" button
    Then my comment should be successfully created
    And I should see my comment
    And the editor should be cleared

  Scenario: View short comments
    Given I visit "post/bWBjpkTKZp/101-essays"
    And I type in the following text:
    """
    This is a medium length comment--it is longer than 300 characters, which was the previous limit for a short message, but it will be less than 1200 characters, which is the new limit for a message that will not be abbreviated. This is just a little bit more text to push it past the limit of 300 characters.
    """
    And I click on the "Comment" button
    Then my comment should be successfully created
    And I should see the entirety of my comment
    And the editor should be cleared

  Scenario: View long comments
    Given I visit "post/bWBjpkTKZp/101-essays"
    And I type in the following text:
    """
    This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters. This is a very long comment, it is over 1200 characters.
    """
    And I click on the "Comment" button
    Then my comment should be successfully created
    And I should see an abreviated version of my comment
    And the editor should be cleared