# CONTRIBUTING

Thank you so much for thinking of contributing to the Human Connection project! It's awesome you're here, we really appreciate it. :-\)

## Getting Set Up

Instructions for how to install all the necessary software and some code guidelines can be found in our [documentation](https://docs.human-connection.org/human-connection/).

To get you started we recommend that you join forces with a regular contributor. Please join [our discord instance](https://human-connection.org/discord) to chat with developers or just get in touch directly on an issue on either [Github](https://github.com/Human-Connection/Human-Connection/issues) or [Zenhub](https://app.zenhub.com/workspaces/human-connection-nitro-5c0154ecc699f60fc92cf11f/boards?repos=152252353):

![](https://dl.dropbox.com/s/vbmcihkduy9dhko/Screenshot%202019-01-03%2015.50.11.png?dl=0)

We also have regular pair programming sessions that you are very welcome to join! We feel this is often the best way to get to know both the project and the team. Most developers are also available for spontaneous sessions if the times listed below don't work for you – just ping us on discord.

## Development Flow

We operate in two week sprints that are planned, estimated and prioritised on [Zenhub](https://app.zenhub.com/workspaces/human-connection-nitro-5c0154ecc699f60fc92cf11f). All issues are also linked to and synced with [Github](https://github.com/Human-Connection/Human-Connection/issues). Look for the `good first issue` label if you're not sure where to start!

We try to discuss all questions directly related to a feature or bug in the respective issue, in order to preserve it for the future and for other developers. We use discord for real-time communication.

This is how we solve bugs and implement features, step by step:
1. We find an issue we want to work on, usually during the sprint planning but as an open source contributor this can happen at any time.
2. We communicate with the team to see if the issue is still available. (When you comment on an issue but don't get an answer there within 1-2 days try to mention @Human-Connection/hc-dev-team to make sure we check in.)
3. We make sure we understand the issue in detail – what problem is it solving and how should it be implemented?
4. We assign ourselves to the issue and move it to `In Progress` on [Zenhub](https://app.zenhub.com/workspaces/human-connection-nitro-5c0154ecc699f60fc92cf11f).
5. We start working on it in a `new branch` and open a `pull request` prefixed with `[WIP]` (work in progress) to which we regularly push our changes.
6. When questions come up we clarify them with the team (directly in the issue on Github).
7. When we are happy with our work and our PR is passing all tests we remove the `[WIP]` from the PR description and ask for reviews (if you're not sure who to ask there is @Human-Connection/hc-dev-team which pings all core developers).
8. We then incorporate the suggestions from the reviews into our work and once it has been approved it can be merged into master!

Every pull request needs to:
* fix an issue (if there is something you want to work on but there is no issue for it, create one first and discuss it with the team)
* include tests for the code that is added or changed
* pass all tests (linter, backend, frontend, end-to-end)
* be approved by at least 1 developer who is not the owner of the PR (when more than 10 files were changed it needs 2 approvals)

## The Team

There are many volunteers all around the world helping us build this network and without their contributions we wouldn't be where we are today. Big thank you to all of you!

You can see the core team behind Human Connection [on our website](https://human-connection.org/en/the-team/). On Github you will mostly run into our developers:
* Robert (@roschaefer)
* Matt (@mattwr18)
* Wolle (@Tirokk)
* Alex (@ogerly)
* Alina (@alina-beck)
* Martin (@datenbrei), our head of IT
* and sometimes Dennis (@DennisHack), the founder of Human Connection

## Meetings and Pair Programming Sessions

Times below refer to **German Time** – that's CET (GMT+1) in winter and CEST (GMT+2) in summer – because most Human Connection core team members are living in Germany.

Daily standup
* every Monday–Friday 11:30
* in the discord `Conference Room`
* all contributors welcome!
* everybody shares what they are working on and asks for help if they are blocked

Regular pair programming sessions
* every Monday, Wednesday and Thursday 15:00
* the link will be posted in the [discord chat](https://discord.gg/6ub73U3) and on the [Agile Ventures website](https://www.agileventures.org/events?utf8=%E2%9C%93&project_id=220&commit=Filter+by+Project)
* all contributors welcome!
* we team up and work on an issue together (often using Visual Studio live sharing sessions)

Open-Source Community Meeting
* every Thursday 13:00
* the link will be posted in the [discord chat](https://discord.gg/6ub73U3) and on the [Agile Ventures website](https://www.agileventures.org/events?utf8=%E2%9C%93&project_id=220&commit=Filter+by+Project)
* all contributors welcome!

Meet the team
* every Monday 21:00 (at the moment only in German)
* details here https://human-connection.org/veranstaltungen/
* via this [zoom link](https://zoom.us/j/936943532)
* all contributors and users of the network welcome!
* users of the network chat with the Human Connection team and discuss current questions and issues

Sprint planning
* bi-weekly on Tuesday 13:00
* via this [zoom link](https://zoom.us/j/7743582385)
* all contributors welcome (recommended for those who want to work on an issue in this sprint)
* we select and prioritise the issues we will work on in the following two weeks

Sprint retrospective
* bi-weekly on Monday 13:00
* via this [zoom link](https://zoom.us/j/7743582385)
* all contributors welcome (most interesting for those who participated in the sprint)
* we review the past sprint and talk about what went well and what we could improve

## Philosophy

We practise [collective code ownership](http://www.extremeprogramming.org/rules/collective.html) rather than strong code ownership, which means that:
* developers can make contributions to other people's PRs (after checking in with them)
* we avoid blocking because someone else isn't working, so we sometimes take over PRs from other developers
* everyone should always push their code to branches so others can see it

We believe in open source contributions as a learning experience – everyone is welcome to join our team of volunteers and to contribute to the project, no matter their background or level of experience.

We use pair programming sessions as a tool for knowledge sharing. We can learn a lot from each other and only by sharing what we know and overcoming challenges together can we grow as a team and truly own this project collectively.

As a volunteeer you have no commitment except your own self development and your awesomeness by contributing to this free and open-source software project. Cheers to you!
