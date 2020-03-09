Feature: Block a User
  As a user
  I'd like to have a button to block another user
  To prevent him from seeing and interacting with my contributions

  Background:
    Given I have a user account
    And there is an annoying user called "Harassing User"
    And I am logged in

  Scenario: Block a user
    Given I am on the profile page of the annoying user
    When I click on "Block user" from the content menu in the user info box
    And I "should" see "Unblock user" from the content menu in the user info box
    And I navigate to my "Blocked users" settings page
    Then I can see the following table:
      | Avatar | Name           |
      |        | Harassing User |

  Scenario: Blocked user cannot interact with my contributions
    Given I block the user "Harassing User"
    And I previously created a post
    And a blocked user visits the post page of one of my authored posts
    Then they should see a text explaining why commenting is not possible
    And they should not see the comment form

  Scenario: Block a previously followed user
    Given I follow the user "Harassing User"
    When I visit the profile page of the annoying user
    And I click on "Block user" from the content menu in the user info box
    And I get removed from his follower collection
    And I "should" see "Unblock user" from the content menu in the user info box

  Scenario: Posts of blocked users are not filtered from search results
    Given "Harassing User" wrote a post "You can still see my posts"
    And I block the user "Harassing User"
    When I search for "see"
    Then I should see the following posts in the select dropdown:
      | title                      |
      | You can still see my posts |

  Scenario: Blocked users can still see my posts
    Given I previously created a post
    And I block the user "Harassing User"
    And the "blocked" user searches for "previously created"
    Then I should see the following posts in the select dropdown:
      | title                   |
      | previously created post |

  Scenario: Blocked users cannot see they are blocked in their list
    Given a user has blocked me 
    And I navigate to my "Blocked users" settings page
    Then I should see no users in my blocked users list

  Scenario: Blocked users should not see link or button to unblock, only blocking users
    Given a user has blocked me
    When I visit the profile page of the annoying user
    And I should see the "Follow" button
    And I should not see "Unblock user" button
    And I "should not" see "Unblock user" from the content menu in the user info box
