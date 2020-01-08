Feature: Admins can pin posts
  As an an admin
  I would like to be able to to mark posts as pinned
  So that it can be available to all users by default

  Background:
    Given we have the following posts in our database:
      | title              | slug             | createdAt  | pinned |
      |  101 Essays        | 101-essays       | 2019-10-26 |        |
      |  102 Second        | 102-second       | 2019-10-11 |        |
    
    
    Scenario: Admin creates pinned post
      Given I am logged in with a "admin" role
      Then I should see the post with title "101 Essays" before other posts
      And I should be able to pin the post whose title contains "102 Second"
      And post with title "102 Second" should have ribbon for pinned posts
      # And I should see the toaster with text "Post pinned successfully!"
      Then I should see the post with title "102 Second" before other posts
    
    Scenario: Pinned post appear before other posts for regular users
      Given we have the following posts in our database:
        | title              | slug             | createdAt  | pinned |
        | Initially pinned   | initially-pinned | 2019-06-11 | true   |
      And  I am logged in with a "user" role
      Then I should see the post with title "Initially pinned" before other posts
      And I should be able to pin the post whose title contains "102 Second"
      And post with title "102 Second" should have ribbon for pinned posts
      Then I should see the post with title "102 Second" before other posts

    Scenario: Newly pinned posts appears before previously pinned post
        Given we have the following posts in our database:
        | title              | slug             | createdAt  | pinned |
        | Initially pinned   | initially-pinned | 2019-06-11 | true   |
      And I am logged in with a "admin" role
      Then I should see the post with title "Initially pinned" before other posts
      And I should be able to pin the post whose title contains "102 Second"
      And post with title "102 Second" should have ribbon for pinned posts
      And post with title "Initially pinned" should not have ribbon for pinned posts
      # And I should see the toaster with text "Post pinned successfully!"
      Then I should see the post with title "102 Second" before other posts


    
      # test as regular user
      # Pinning a post does not change the order of the user's profile posts
      # post should not be pinned on the profile page but only the news feed
      # create a post by another user and pin it and it should (use neode.update? cy.neode)
      # create a new factory to update
    
      