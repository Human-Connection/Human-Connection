# Network Specification

Human Connection is a nonprofit social, action and knowledge network that connects information to action and promotes positive local and global change in all areas of life.

* **Social**: Interact with other people not just by commenting their posts, but by providing **Pro & Contra** arguments, give a **Versus** or ask them by integrated **Chat** or **Let's Talk**
* **Knowledge**: Read articles about interesting topics and find related posts in the **More Info** tab or by **Filtering** based on **Categories** and **Tagging** or by using the **Fulltext Search**.
* **Action**: Don't just read about how to make the world a better place, but come into **Action** by following provided suggestions on the **Action** tab provided by other people or **Organisations**.

## Features

The following features will be implemented. This gets done in three steps:

1. First we will implement a basic feature set and provide a test system to test the basic network functionality.
2. In a second step we will make our prototype publicly available with an advanced feature set including the technology and organizational structure to drive a bigger public social network.
3. In a third step all the remaining features will be implemented to build the full product.

### User Account

[Cucumber Features](./integration/user_account)

* Sign-up
* Agree to Data Privacy Statement
* Agree to Terms of Service
* Login
* Logoff
* Change User Name
* Change Email Address
* Change Password
* Delete Account
* Download User's Content
* GDPR-Information about stored Content
* Choosing Interface Language \(e.g. German / English / French\)
* Persistent Links

### User Profile

[Cucumber Features](./integration/user_profile)

* Upload and Change Avatar
* Upload and Change Profile Picture
* Edit Social Media Accounts
* Edit Locale information
* Show and delete Bookmarks \(later\)
* Show Posts of a specific User
* Show Comments of a specific User

### Dashboard

[Clickdummy](https://preview.uxpin.com/24a2ab8adcd84f9a763d87ed27251351225e0ecd#/pages/99768919/simulate/sitemap?mode=i)

* Show Link to own Profile
* Show Friends Widget
* Show Favorites Widget
* Show Get Friends Widget
* Show popular Hashtags Widget
* Show Mini-Statistics Widget \(all time\)
* Show Chatrooms Widget
* Show List of Let's Talk requests with online status of requesting people

### Posts

[Cucumber Features](./integration/post/)

* Creating Posts
* Persistent Links
* Upload Teaser Picture for Post
* Upload additional Pictures
* Editing Title and Content
* Allow embedded Conten \(Videos, Sound, ...\)
* Choosing a Category
* Adding Tags
* Choosing Language \(e.g. German / English / French\)
* Choosing Visibility \(Public / Friends / Private\)
* Shout Button for Posts
* Bookmark Posts \(later\)
* Optionally provide Let's Talk Feature
* Optionally provide Commenting Feature

### Comments

* Creating Comments 
* Deleting Comments
* Editing Comments
* Upvote comments of others

### Notifications
[Cucumber features](./integration/notifications)

* User @-mentionings
* Notify authors for comments
* Administrative notifications to all users

### Contribution List

* Show Posts by Tiles
* Show Posts as List
* Filter by Category \(Health and Wellbeing, Global Peace & Non-Violence, ...\) 
* Filter by Mood \(Funny, Happy, Surprised, Cry, Angry, ...\)
* Filter by Source \(Connections, Following, Individuals, Non-Profits, ...\)
* Filter by Posts & Tools \(Post, Events, CanDos, ...\)
* Filter by Format Type \(Text, Pictures, Video, ...\)
* Extended Filter \(Continent, Country, Language, ...\) 
* Sort Posts by Date
* Sort Posts by Shouts
* Sort Posts by most Comments
* Sort Posts by Emoji-Count \(all Types\)

### Blacklist

[Video](https://www.youtube.com/watch?v=-uDvvmN8hLQ)

* Blacklist Users
* Blacklist specific Terms
* Blacklist Tags
* Switch on/off Adult Content

### Search

[Cucumber Features](./integration/search)

* Search for Categories
* Search for Tags
* Fulltext Search

### CanDos

* Creating CanDos
* Editing Title and Content
* Choosing a Category
* Adding Tags
* Choosing Language \(e.g. German / English / French\)
* Choosing Visibility \(Public / Friends / Private\)
* Choosing Difficulty
* Editing Why - why should you do this
* Editing Usefulness - what is it good for

### Versus \(interaction on existing Post\)

* Create / edit / delete Versus

### Jobs

* Create, edit and delete Jobs by an User
* Handle Jobs as Part of Projects
* Handle Jobs done by Organizations

### Projects

* Create, edit and delete Projects
* Edit Title and Description for the Project
* Set Project Type
* Set and Edit Timeline for the Project
* Add Media to the Project
* Chat about the Project

### Pro & Contra

* Create Pro and Con \(2-row\)
* Add Arguments on Pro or Con Side
* Rate up Arguments
* Add Tags
* Attach Media

### Votes

* Create Votes \(Surveys with two or more Choices\)
* Add Title and Description
* Let Users vote
* Add Tags

### Bestlist

* Create Bestlist
* Create Votes \(Surveys\)
* Add Title and Description
* Add Tags
* Let Users vote for Best Item
* Set Settings \(allow Uploads, allow Links, ...\)

### Events

* Create Events
* Add Title and Description
* Choose Date and Location
* Add Tags

### More Info

Shows autmatically releated information for existing post.

* Show related Posts
* Show Pros and Cons
* Show Bestlist
* Show Votes
* Link to corresponding Chatroom 

### Take Action

Shows automatically related actions for existing post.

* Show related Organisations
* Show related CanDos
* Show related Projects
* Show related Jobs
* Show related Events
* Show Map

### Badges System

* Importing Badge Information \(CSV\)
* Showing Badges
* Badge Administration by Admins
* Choosing Badges to display by User

### Chat

* Basic 1:1 Chat functionality

### Let's Talk

* Request Let's talk with Author of Post
* Requestor can request private or public Let's Talk
* Requestor can choose the Chat format \(Video, Audio, Text\)
* Interact with interested People 1:1
* Approve request from Requestor

### Organizations

* Propose Organizations by users
* Set Name and Details
* Set Homepage
* Set Region
* Set Topic
* Commit organizations by HC-Org-Team
* Panel for Organisation Handling by themselfes
* Choose/Mark Users as authorized to manage an Organization

### Moderation

[Cucumber Features](./integration/moderation)

* Report Button for users for doubtful Content
* Moderator Panel
* List of reported Content \(later replaced by User-Moderation\)
* Mark verified Users as Moderators
* Show Posts to be moderated highlighted to User-Moderators
* Statistics about kinds of reported Content by Time
* Statistics about Decisions in Moderation

### Administration

* Provide Admin-Interface to send Users Invite Code
* Static Pages for Data Privacy Statement ...
* Create, edit and delete Announcements
* Show Announcements on top of User Interface

### Invitation

* Allow Users to invite others by Email
* Allow Users to register with Invite Code
* Double-opt-in by Email

### Internationalization

[Cucumber Features](./integration/internationalization)

* Frontend UI
* Backend Error Messages

### Federation

* Provide Server-Server ActivityPub-API
* Provide User-Server Activitypub-API
* Receiving public addressed Article and Note Objects
* Receiving Like and Follow Activities
* Receiving Undo and Delete Activities for Articles and Notes
* Serving Webfinger records and Actor Objects
* Serving Followers, Following and Outbox collections

