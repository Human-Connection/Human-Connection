Feature: Admins can pin posts
  As an an admin
  I would like to be able to to mark posts as pinned
  So that it can be available to all users by default

  Background:
    Given we have the following posts in our database:
      | id         | title                                          | slug       | createdAt  |
      | bWBjpkTKZp | 101 Essays that will change the way you think  | 101-essays | 2019-10-26 |
      | bWBjpkTKwb | 102 Some posts will pinned after this exercise | 102-essays | 2019-10-11 |
    
    
    Scenario: Admin creates pinned post
      Given I am logged in with a "admin" role
      Then I should see latest post first
      # Then I can pin the post with "id"