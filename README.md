# PS Toolbox

`PS Toolbox.html` is a **generated file**: one self-contained page you can share. Don't edit it directly. Edit the files in `src/` instead, then rebuild:

```sh
node build.js
```

## Layout

```
src/
  shell.html          page markup (top bar, tabs, panels, dialogs) with build placeholders
  styles/             CSS, joined in filename order
    01-base.css         tokens, dark mode, base elements, svg
    02-app-shell.css    shell, design / simulate / survey / install, drawer
    03-ux-pass.css      later layout and polish overrides
  rooms/              Conference Rooms app JS, joined in filename order into one closure
    00-db.js            sync with the MySQL server (see Database below)
    00-helpers.js       formatting, storage key, ids
    01-catalog.js       platforms, bars, displays, mounts, anchors, accessories
    02-state.js         cfg / UI state and saving
    03-calc.js          derived numbers (heights, loads, drops, outlets)
    04-checks.js        design checks, explanations and auto-fixes
    05-controls.js      form controls and their event binding
    06-checks-render.js
    07-drawings.js      wall layout and SVG drawings
    08-survey.js
    09-install.js
    10-presets.js
    11-chrome.js        tabs, dialogs, learning mode
    12-report.js        Word report export
    13-rooms.js         multi-room project handling
    14-modules.js       Doors / Network module switching and iframes
    15-init.js          startup
  apps/
    doors.html          UniFi Access wiring simulator (standalone page)
    network.html        UniFi network and home run planner (standalone page)
```

## Database (Conference Rooms)

Rooms projects save to MySQL / MariaDB through a small Node server in `server/`. Each project is one row in `projects`, and all its rooms and setups are stored together as one JSON document. The browser still keeps its own copy, so nothing is lost when the connection drops. Changes sync when it comes back. Door access and network plans still save in the browser only.

**The server has no sign-in. Out of the box it only accepts connections from the computer it runs on (see `HOST` below).**

Set it up once:

```sh
mysql -u root -p < server/schema.sql        # creates the ps_toolbox database and projects table
# then create a user for the app, e.g.
#   CREATE USER 'ps_toolbox'@'%' IDENTIFIED BY '...';
#   GRANT SELECT, INSERT, UPDATE ON ps_toolbox.* TO 'ps_toolbox'@'%';
cd server && npm install
```

Run it:

```sh
node build.js
cd server && npm start
```

`npm start` reads the database settings from `server/.env` (one `NAME=value` per line). Keep that file private, because it holds the password. You can also set the same names as environment variables instead.

Then open `http://localhost:3000/`. Settings are `DB_HOST`, `DB_PORT` (3306), `DB_USER`, `DB_PASSWORD`, `DB_NAME` (`ps_toolbox`), `PORT` (3000), `HOST` and `ALLOWED_HOSTS`.

By default the server only answers on this computer (`HOST=127.0.0.1`). To let other people reach it, set `HOST=0.0.0.0`. Also list the address they'll type in `ALLOWED_HOSTS`, for example `ALLOWED_HOSTS=toolbox.networkright.com`. Only do this once it's behind a sign-in such as a VPN or Cloudflare Access. The server refuses requests from other websites and from host names it doesn't recognise.

- The address shows `?project=<id>`. Share that link to send someone straight to a project.
- Open **Rooms** to see the database status, the company list and **+ New company**. You can also switch companies from the name at the top left.
- If two people save the same project, the second save is refused, and that person chooses whether to keep their own version or load the database version.
- Opening `PS Toolbox.html` straight from disk still works, but it then saves in that browser only. Use `http://localhost:3000` to save to the database.

The browser-side code is `src/rooms/00-db.js`. Storage only touches it in `00-helpers.js` (loading) and `02-state.js` (saving).

## Notes

The `rooms/*.js` files all share one function scope, so a variable in one file is visible in the files after it. Keep the numeric prefixes so the order stays the same.

`apps/doors.html` and `apps/network.html` are full pages. You can open either one in a browser on its own to work on it. The build embeds each one as a string, and the toolbox loads it into an iframe.
