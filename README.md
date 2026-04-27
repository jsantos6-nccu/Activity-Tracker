# Local Activity Tracker

A browser-based, mobile-friendly prototype for tracking work and personal activities with a simple Start/Stop workflow. By default, data is stored locally in the browser using `localStorage`, with optional peer-to-peer live linking and encrypted backup transfer for private multi-device use.

## Features

- Start and stop activities in real time
- Pause and resume a live activity without ending it
- Add a completed activity manually when you forgot to log it live
- Edit a saved activity later if it ended early or kept running too long
- Enter an activity name, choose a category, and optionally add notes or tags
- Create, edit, and remove custom groups and custom categories
- Organize the app as `Group -> Category -> Activity -> Notes/Tags`
- Save common activities to a Frequently Used list for one-tap starting
- View a history of completed activities
- Delete incorrect entries, restore them from a recently deleted list, or permanently remove them
- Use tabs to switch between Frequently Used, Label Manager, Recently Deleted, Devices, Private Backup, and Analytics
- Store activity data locally in the browser with `localStorage`
- Use a sync-ready local data model with stable record IDs and device metadata for future private multi-device support
- Exchange live device codes to sync changes directly while both devices are open
- Download and import encrypted full-app backups for private transfer between your own devices
- Support installable web-app launching from a hosted URL on phone or desktop
- Filter reports by date range
- See total tracked time, top groups, top categories, daily details, and simple visual summaries
- Export saved logs as `CSV` or `JSON`
- Use the app comfortably on desktop or phone-sized screens

## File Structure

- `index.html` - Main app layout
- `styles.css` - Responsive styling and UI design
- `app.js` - Activity tracking, storage, rendering, analytics, and export logic
- `README.md` - Project overview and run instructions

## How to Run Locally

Because this is a plain HTML/CSS/JavaScript project, there is no build step.

### Option 1: Open directly in a browser

1. Open the project folder.
2. Double-click `index.html`.
3. The app will open in your default browser.

### Option 2: Use a simple local server

If you prefer running from a local server, you can use any lightweight option such as:

- VS Code Live Server
- `python -m http.server`

Then open the local address shown by the server in your browser.

### Option 3: Host it at a URL for phone use

To start from a phone, host the app at a web address such as:

- GitHub Pages
- Netlify
- Vercel

Then open that URL on the phone. From there, the `Devices` tab can be used for live linking, and supported browsers may offer `Install App` or `Add to Home Screen`.

## How the App Works

1. Open the `Label Manager` tab and create at least one group, such as `Work`, `Personal`, or `Other`.
2. Create one or more categories inside those groups, such as `House Chores`, `Homework`, `Teaching`, `Errands`, or `Exercise`.
3. Enter an activity name.
4. Choose one of your saved categories.
5. Optionally add notes or tags.
6. Click `Start Activity`.
7. Use `Pause` and `Resume` if you need to temporarily stop tracking without ending the activity.
8. When finished, click `Stop Current`.
9. If you forgot to log something, open the `Add Activity` tab in the tracking panel and save it with a start and end time.
10. If a saved entry needs a correction, click `Edit` in the history list and update it from the same `Add Activity` form.
11. Save recurring activities to the `Frequently Used` tab for future one-tap tracking.
12. Review saved entries in the history panel.
13. If you delete something by mistake, restore it from the `Recently Deleted` tab or permanently delete it there.
14. Use the `Devices` tab to generate a live connection code, paste the reply code from a second device, and keep both devices synced while both apps stay open.
15. Use the `Analytics` tab for a ranged overview or switch to `Daily Detail` for a chosen-day timeline and breakdown.
16. Export your data as `CSV` or `JSON` if needed.
17. Use the `Private Backup` tab to download an encrypted full-app backup and merge it on another device with the same passphrase.

## Data Storage

- Completed activities are saved in `localStorage`
- Frequently Used presets are saved in `localStorage`
- Group definitions are saved in `localStorage`
- Category definitions are saved in `localStorage`
- Recently deleted activities are also saved locally so they can be restored after a refresh
- The currently running activity is also saved in `localStorage`
- A consolidated local snapshot and per-device identifier are also stored to prepare for future sync features
- Encrypted backup files can be created manually for private transfer between devices
- Refreshing the page will preserve the running timer state and saved history in the same browser
- Data stays on the local machine unless the user exports it manually
- Live device linking is peer-to-peer and currently works while both devices are open during the same session

## Activity Data Model

Each completed activity stores:

- Group name
- Activity name
- Category name
- Start time
- End time
- Duration
- Notes or tags

## Notes for Future Improvements

This MVP is intentionally lightweight. Useful next steps could include:

- Editing a currently running activity's start time before stopping it
- Persistent trusted-device pairing with reconnecting live sync
- Automatic end-to-end encrypted multi-device sync without manual code exchange
- More detailed charts
- Daily or weekly summaries
- Search and tag filtering
- Importing previously exported data
- Drag-and-drop reordering for Frequently Used presets
