Feature: Admins can pin posts
  As an an admin
  I would like to be able to to mark posts as pinned
  So that it can be available to all users by default

  Background:
    Given we have the following posts in our database:
      | id         | title        | slug       | createdAt  |
      | bWBjpkTKZp | 101 Essays   | 101-essays | 2019-10-26 |
      | bWBjpkTKwb | 102 Second   | 102-second | 2019-10-11 |
    
    
    Scenario: Admin creates pinned post
      Given I am logged in with a "admin" role
      Then I should see post with title "101 Essays" before the post with title "102 Second"
      And I should be able to pin the post whose title contains "102 Second"
      And post with title "102 Second" should have ribbon for pinned posts
      # And I should see post with title "102 Second" before the post with title "101 Essays"
      