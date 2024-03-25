# Minimal CMS

[Minimal CMS](https://cms.aureliendossantos.com) is a simple way to edit your personal blog (or any other kind of repo) and commit to it right from your browser, with an phone-friendly UI.

## Why?

Most git-based CMS are either too complicated to setup or too expensive to use, accumulating unnecessary features to justify their pricing. For a developer, they don't offer an interesting alternative to an already owned code editor.

But code editors aren't a good fit for quick edits on a phone. And your notes app can't talk to your git repo... So currently, there's no simple, free and phone-friendly CMS to quickly write down & publish that idea you just had in the middle of the day.

Minimal CMS fills that gap, while being customizable—but not cumbersome.

## Features

⚠️ Minimal CMS is available but very early in development:

- [ ] Protection for user access tokens (currently, the 8-hour token is stored in a cookie)
- [x] Browse your repos
- [x] See number of subfolders & files
- [ ] Pagination for file explorer ("See more")
- [ ] Type to find a file
- [ ] Quick access to favorite files
- [x] Edit existing files
- [ ] Create new files
- [x] Preview the diff
- [x] Commit instantly
- [ ] Confirmation modal
- [ ] Upload images
- [x] Preview images
- [ ] Trigger manual deployments
- [ ] Shortcuts to insert Markdown syntax or custom text
- [ ] Extendable shortcuts (using external APIs)
- [ ] Syntax highlighting
- [ ] Group multiple edits in a single commit
- [ ] Find a more catchy name than Minimal CMS

## Personal data

Minimal CMS only stores your GitHub ID, your username, your name (optional), your public email (optional), and the custom settings you specify in the app. If your public name and email are not set on GitHub, commits are signed with your username and a no-reply email.

The app uses expiring user access tokens that must be refreshed with an authenticated request after 8 hours.
