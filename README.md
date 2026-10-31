# Golf Assistant

Golf Assistant is a phone-friendly golf scorekeeper and voice caddie built collaboratively by Drake Parsons and Codex. It combines manual round controls, natural-language AI, course data from GOLFAPI, and GPS distances in a browser app that can be added to a phone's home screen.

The project began as a manual scorecard prototype. Our work has expanded it into an AI-assisted on-course experience with a redesigned mobile interface, a Node backend, live course-data loading, voice capture, spoken responses, and initial club recommendations.

**Current stage:** a working prototype for field testing. It is a progressive web app (PWA), not yet a native App Store or Google Play release. Smart-glasses integration is deferred.

## What We Have Built

### Mobile Interface and Navigation

The interface follows the patterns that leading golf apps (Arccos, Hole19, 18Birdies, Golfshot) have converged on: the number you need is the largest thing on screen, scoring takes one tap per stroke, and every control is thumb-sized.

- A home screen with a status line for any round in progress, a primary **Start Round** button that becomes **See Current Round**, counts of saved courses, logged shots, and learned clubs, and quick-access tiles.
- A separate round-setup page for course, players, and holes, with the GOLFAPI search and the course-and-tee picker below it.
- An active-round screen built around the hole: a sticky hole header with previous/next controls, par, and tee length; a large center-green distance with front and back beside it; one score row per player with − and + steppers sized for gloves; the caddie conversation; and a shot log.
- A floating microphone button that stays reachable while scrolling and turns red while listening.
- A vertical scorecard with a totals panel and per-hole cards. Scores use the conventional notation: circle for birdie, double circle for eagle or better, square for bogey, double square for double bogey or worse, plain text for par. The current hole is outlined.
- A yardage screen with front, center, and back read out in large figures, plus collapsible editors for green coordinates and hazards.
- A **glance view**, opened from the distance card on the active round: a full-screen, high-contrast layout showing the hole number and par, the center-green distance as the largest element on screen, the club the caddie would pick and why, and front/back distances beneath. It refreshes every two seconds from the round's existing GPS watch, holds the screen awake, and carries previous/next hole buttons sized for a gloved thumb. The layout reflows for a landscape phone on a cart mount, which is why the manifest no longer locks the app to portrait. Nothing on it needs to be tapped to stay current.
- A Settings screen grouping server access, the club-distance editor, and shot history.
- Bottom navigation between Home, Scorecard, Yardage, Round, and More.

The interface adapts to the phone's light or dark appearance, respects reduced-motion settings, and keeps controls clear of the home indicator and notch through safe-area insets. GPS figures appear in both the round and yardage screens and reset when the hole changes.

The earlier decorative hole-map graphic has been removed rather than restyled: it suggested a course layout the app does not have. A real mapped hole view remains future work.

### Round Management and Scoring

- Start a 9- or 18-hole round with named players, and add or remove players mid-round.
- Enter scores with steppers, by keyboard, or through natural speech. Scores save as you tap, when you leave the Round screen, and when the app is backgrounded, so a stroke is never lost by switching tabs.
- Track putts, fairways hit, and greens in regulation per player per hole. Totals appear on the scorecard.
- Undo the last score, putt, fairway, or green change.
- Correct an existing score for a named player and hole.
- View totals, the current leader, and performance relative to par.
- Move to the next, previous, or a specified hole.
- Edit the current hole's par.
- End a round manually with **End Round** or through the voice agent. Finishing or resetting a round archives it to `golfRoundHistory`; the five most recent appear on the home screen and the full set exports as JSON.
- Reopening the app after a long gap offers **Resume** or **Start fresh** instead of silently continuing a stale round.
- The screen stays awake while a round is active, and GPS keeps a warm fix so distance answers are immediate.
- Distances follow a yards or meters preference set in Settings.

Voice action handlers validate player names, scores from 1 through 20, holes within the round, and pars from 3 through 6 before applying those actions. Confirmations and errors use in-app messages rather than blocking browser dialogs.

### Natural-Language Voice Agent

Voice requests go to OpenAI first. The app sends the transcript and round context to its own backend, which calls the OpenAI Responses API with a strict JSON schema. The frontend checks the returned action and executes the corresponding app function.

The agent can route requests to:

| Action | Purpose |
| --- | --- |
| `start_round` | Start a round using the supplied course and players |
| `end_round` | Finish the active round |
| `save_scores` | Record player scores |
| `change_score` | Correct a score |
| `set_par` | Update hole par |
| `go_to_hole` | Navigate the round |
| `answer_question` | Answer a contextual question |
| `recommend_club` | Provide initial club and shot advice |
| `get_green_yardage` | Calculate green distances using browser GPS |
| `get_hazard_distance` | Calculate distances to saved hazards |
| `clarify` | Ask for missing information |
| `unknown` | Handle an unsupported request |

Responses include `action`, `confidence`, `payload`, `message`, and `speak`. The existing command parser remains a backup when the AI request fails, times out, or returns an unusable result. Backup handling understands fewer phrases than the AI.

Examples to test:

- "Start a round at Prairie Pines with Alex and Sam."
- "I had par and Sam had bogey."
- "Actually change Sam on hole one to six."
- "Who's winning?"
- "How am I doing compared to Sam?"
- "Move us to the next hole."
- "How far is the right bunker?"
- "I have 150 yards. What club should I hit?"
- "End the round."

Starting a round by voice can reuse a matching saved course. It does not guarantee a live GOLFAPI lookup for an arbitrary spoken course name; search and load the course first when mapped data is needed.

### Voice Capture and Spoken Responses

- Browser speech recognition captures speech where supported.
- Transcript accumulation and silence handling help avoid sending only the beginning of a spoken request.
- Browsers without usable speech recognition can use microphone recording and server-side OpenAI transcription when recording is supported.
- Status messages explain unsupported voice capture, microphone permission problems, recording, and processing.
- Browser speech synthesis reads responses aloud after the user enables voice responses.

This is a hybrid voice flow: capture, transcribe, interpret, execute, and speak. It is not an OpenAI Realtime speech-to-speech session. Speech output currently uses the browser's voices rather than a custom OpenAI voice. Response time depends on capture, network, hosting, transcription when needed, and model processing; responses are not streamed.

### GOLFAPI Course Data

The backend proxies authenticated GOLFAPI requests so the frontend does not need the provider key. The course library supports search, loading, and local saving of course setups.

Course loading retrieves available:

- Club and course identity.
- Hole count and per-hole pars.
- Tee information and per-hole lengths, displayed in yards.
- Front, center, and back green coordinates.
- Other mapped points that can be represented as hazards or layup targets.

Search returns clubs. Selecting a club opens a course-and-tee picker that lists every course at the club and every tee with its total yardage. An 18-hole course and a playable White tee are preselected when present, but any course and tee can be chosen before loading. The loaded setup records the chosen tee name, and its saved ID includes the club, course, and tee so different tees at the same club are separate setups.

We added separate coordinate retrieval and corrected course-detail parsing after testing Oklahoma City Golf & Country Club (OKCGCC). Missing data remains possible for other courses. When pars are missing, the prototype defaults to par 4; missing lengths are shown as unavailable rather than a fixed example length.

Previously saved setups may retain older incomplete data. Search and reload the course to fetch updated pars, lengths, or coordinates, then save the refreshed setup.

The GOLFAPI CSV samples were used to understand the provider's structure. The app's import control accepts its own JSON course format, not raw GOLFAPI CSV files. Purchased datasets and credentials should not be committed to the repository.

### GPS Yardage, Hazards, and Course Library

- Calculate distances from the user's current browser location to saved green targets.
- Display front, center, and back yardages when those coordinates exist.
- Ask for distances through voice.
- Add and clear named hazards and layup targets for each hole.
- Enter green coordinates manually if provider data is missing.
- Save course setups locally for reuse.
- Import and export saved course setups as JSON.

GPS calculations run in the frontend. A mapped point is required to calculate its distance. Distances are straight-line estimates based on coordinates, not slope-adjusted playing distances or walking routes. Every reading reports its GPS accuracy, and a fix worse than 25 meters is labeled approximate in both the on-screen text and the spoken answer.

### Caddie and Club Recommendations

Club questions have a dedicated `recommend_club` action so they are handled as shot advice. The backend receives the current hole's par, length, green target, hazards, and the golfer's club distances.

Recommendations can use a spoken distance or, when available, GPS distance to the center of the green. Responses include a club, target, preferred miss, hazard advice, and reasoning.

Club choice is personal when data exists. The app picks the shortest club that still covers the distance from the golfer's own distances, and only falls back to the general chart when no personal data exists. The spoken reason states where the number came from: a saved profile distance or a learned distance from logged shots.

Advice is adjusted for measured conditions. Before a club call the app asks its own `/api/conditions` endpoint for wind, temperature, and ground elevation from [Open-Meteo](https://open-meteo.com/), which needs no API key. The measured yardage becomes a playing yardage: the elevation rise between the golfer and the green in yards, roughly a yard per mph of headwind and half that downwind, two yards per ten degrees away from 70F, and a penalty for the selected lie. Each adjustment is named in the answer, and a crosswind above 7 mph is called out without changing the number. Elevation that exceeds a quarter of the shot length is treated as bad map data and ignored rather than trusted. Pin position is still unknown, so the call remains a starting estimate.

### Personal Club Distances and Shot Learning

Settings has a club-distance editor. Each row is a club name and a carry distance between 20 and 400 yards; rows left blank are ignored. Saved distances are stored in `golfPlayerClubProfile` and sent to the AI agent as round context.

The Active Round screen has a shot log. Each entry records club, distance, result (as planned, short, or long), miss direction, lie, course, and hole. A club's distance is learned from the median of its shots marked "as planned" once it has at least three of them, and a learned distance overrides the manually saved one for that club. Once a club has three logged shots and misses to one side in at least half of them, the caddie says so with its recommendation. Shot history can be exported as JSON or cleared in Settings. The log keeps the most recent 500 shots.

After a club recommendation, the shot-log club and distance fields are prefilled so logging the shot takes one tap.

Shots can also be logged by voice. "Log a seven iron, 165, straight" or "I hit pitching wedge 120 and came up short out of the rough" records the shot through the `log_shot` action, filling club, distance, result, lie, and direction from what was said. A shot reported with no distance is refused rather than guessed. Score language is never treated as a shot: "I made a five" scores the hole, "I hit five iron 180" logs a shot.

### Who the Caddie Thinks You Are

Creating an account requires a name, and that name is the golfer's identity everywhere: "I", "me", and "my" in speech, the player the statistics follow, and the name prefilled into round setup. It is stored with the account, so signing in on a second phone adopts the same identity without retyping it, and it can be changed under **Settings → Your name**.

A named player always beats a pronoun, so "what did Sam shoot" answers about Sam even when Sam is the one speaking the request. The golfer no longer has to be the first player in the round for pronouns to work. When the account holder is not playing in the current round, the caddie asks who is meant instead of guessing.

### Statistics

The Statistics screen aggregates finished rounds for the account holder. Rounds of different lengths are scaled to an 18-hole equivalent before being averaged, so a nine-hole round does not distort a scoring average. It reports scoring average, best round, putts per round and per hole, fairways hit, greens in regulation, a five-round form trend, a per-round list, and average strokes against par for par 3s, 4s, and 5s. Par 3s are excluded from fairway chances.

The handicap figure is an estimate and is labeled as one. It follows the shape of a Handicap Index - the best differentials of the last twenty rounds, averaged and multiplied by 0.96 - but measures scores against par rather than against course rating and slope, which the app does not have. At least three rounds of nine or more holes are required before any number is shown.

### Persistence, Accounts, and Installable Web App

- `golfRound` stores round state in browser local storage.
- `golfCourseSetups` stores the local course library.
- `golfPlayerClubProfile` stores the club-distance editor's values.
- `golfShotLog` stores logged shots, including miss direction, and drives learned club distances and miss tendencies.
- `golfRoundHistory` stores finished rounds with scores, pars, and per-hole stats.
- `golfDistanceUnit` stores the yards or meters preference.
- The server access grant is an `HttpOnly` cookie; the shared access code itself is not kept in browser-readable storage.
- A web manifest and icons support adding the app to a phone's home screen.
- The service worker caches only the explicit public app assets, network-first, and never caches API or sign-in URLs.

Browser storage remains the source of truth during a round. Optional passwordless accounts sync finished rounds, saved courses, club distances, and shot history to PostgreSQL for recovery and cross-device use; the active round stays local until it is finished. Without an account, data remains on that browser and clearing site data can remove it. The export controls provide a separate copy. OpenAI and live GOLFAPI requests require internet access.

## How It Works

```text
Phone or desktop browser
  -> speech recognition or microphone recording
  -> Node backend (transcription when needed)
  -> OpenAI interprets transcript and supplied round context
  -> structured action returned to browser
  -> frontend validates and executes the action
  -> UI updates and browser speaks the response

Course search/load -> Node backend -> GOLFAPI -> local course setup
GPS yardage       -> browser location + saved coordinates -> distance
Optional account  -> passwordless email link -> PostgreSQL sync/export/delete
```

The backend uses Node's built-in HTTP server and `fetch`. Its only dependency is `pg`, the PostgreSQL driver used when accounts are enabled. Frontend code is plain HTML, CSS, and JavaScript.

## Run Locally

Use a recent Node.js installation with built-in `fetch`, `FormData`, and `Blob` support. Development has used Node 24. Run commands in **PowerShell** or the VS Code terminal; do not double-click `server.mjs`.

1. Open the repository folder in your terminal:

   ```powershell
   cd "C:\path\to\golf-assistant-prototype"
   ```

2. Install the project's npm metadata/dependencies:

   ```powershell
   npm install
   ```

3. Create a local environment file if one does not already exist:

   ```powershell
   Copy-Item .env.example .env
   ```

   Edit `.env` and replace the placeholder API keys. Do not overwrite an existing configured `.env`.

   ```dotenv
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-5-mini
   OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
   GOLFAPI_API_KEY=your_golfapi_api_key_here
   GOLFAPI_BASE_URL=https://golfapi.io/api/v2.3
   PORT=3000
   HOST=0.0.0.0
   PUBLIC_BASE_URL=http://localhost:3000
   TRUSTED_PROXY_HOPS=0
   APP_ACCESS_TOKEN=choose_a_long_random_access_code
   DATABASE_URL=
   ```

   `APP_ACCESS_TOKEN` is the shared access code for paid API endpoints. The Settings form exchanges it for an `HttpOnly` access cookie; the browser does not retain the code in `localStorage`. Leaving it blank keeps the endpoints open, which is appropriate only for local use on a trusted network. `DATABASE_URL` enables optional accounts and sync. `PUBLIC_BASE_URL` is required with accounts on a non-local deployment so sign-in links never depend on an untrusted request host. Keep `TRUSTED_PROXY_HOPS=0` for a direct server; Render uses `1`. `.env.example` documents the per-client, server-wide, admin, email, and database TLS options.

4. Start the single app server:

   ```powershell
   npm run dev
   ```

   Alternatively, run `node server.mjs`. These are two ways to start the same server; do not run both simultaneously. If Node is only available through the Codex bundled runtime on Windows:

   ```powershell
   & "$env:LOCALAPPDATA\OpenAI\Codex\bin\node.exe" server.mjs
   ```

5. Keep that terminal open and visit [http://127.0.0.1:3000](http://127.0.0.1:3000). Stop the server with **Ctrl+C**.

The backend serves the frontend and API together. A separate static server on port 8000 is not needed and will not provide the AI endpoints. Restart the Node process after changing `.env`.

`GET /api/health` is the smoke endpoint. It reports only the state needed by the browser: whether the service is up, whether an access grant is required and present, whether paid endpoints are paused, and whether accounts are enabled.

## Render Deployment and Phone Testing

The app runs as a Render Node web service: `golf-assistant-prototype` (`srv-d9nrim3ncjis73apnf20`), free plan, Oregon region, deploying `main` automatically on every commit, at [https://golf-assistant-prototype.onrender.com](https://golf-assistant-prototype.onrender.com). `render.yaml` records that configuration in this repository. The service is not currently linked to the blueprint, so the file documents and validates the setup rather than driving it; the dashboard and API remain the source of truth until a blueprint is linked.

1. Connect the service to this repository and the intended branch, normally `main`.
2. Set the service root directory to the folder containing `package.json` and `server.mjs`. Leave it blank if those files are at the repository root.
3. Use `npm install` as the build command and `npm start` as the start command.
4. Set `OPENAI_API_KEY`, `GOLFAPI_API_KEY`, `APP_ACCESS_TOKEN`, `ADMIN_TOKEN`, and any limit overrides in Render. Set `PUBLIC_BASE_URL=https://golf-assistant-prototype.onrender.com` and `TRUSTED_PROXY_HOPS=1`. `DATABASE_URL`, `RESEND_API_KEY`, and `LOGIN_EMAIL_FROM` enable account sync and emailed sign-in links. Keep `HOST=0.0.0.0`; Render supplies `PORT`.
5. Deploy, then open the service's HTTPS URL on the phone and allow microphone/location access when using those features.

Local edits do not change Render. Commit and push them to the connected branch. If automatic deployment is enabled, Render then builds the new commit; otherwise trigger a manual deployment. Check the deployed commit and deployment status in Render before testing.

For same-Wi-Fi layout testing, use `http://<computer-Wi-Fi-IPv4>:3000` while the local server is running. Phone microphone and location features generally require HTTPS, so the deployed HTTPS site is the appropriate field-test environment. The hosted app does not require the development computer to stay on.

Use the phone browser's home-screen installation option where available. An installed PWA remains a web app, not a native store app.

### Managing the Service from a Terminal

Everything in the dashboard is also available through the Render CLI and REST API, which avoids clicking through the dashboard to check a deploy or change a variable.

Authenticate once by creating an API key in Render account settings and exporting it as `RENDER_API_KEY`. Treat it as a full-account credential: it can modify every service in the workspace, and it should never be committed or pasted into a shared transcript.

```bash
export RENDER_API_KEY=...            # never commit this value
SERVICE=srv-d9nrim3ncjis73apnf20

# Current configuration and deploy history
curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$SERVICE"
curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$SERVICE/deploys?limit=5"

# Set one environment variable without touching the others
curl -s -X PUT -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":"new-value"}' \
  "https://api.render.com/v1/services/$SERVICE/env-vars/APP_ACCESS_TOKEN"

# Apply it: environment changes made through the API do not redeploy on their own
curl -s -X POST -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" -d '{"clearCache":"do_not_clear"}' \
  "https://api.render.com/v1/services/$SERVICE/deploys"
```

The CLI covers the same ground once `RENDER_API_KEY` is set, using `-o json --confirm` for non-interactive use:

```bash
render services -o json --confirm
render deploys create $SERVICE --wait -o json --confirm
render logs --resources $SERVICE --limit 50 -o text --confirm
render blueprints validate render.yaml -o json --confirm
```

A deployed build is only confirmed when `/api/health` responds and the deploy's status is `live`.

## Backend Endpoints

| Endpoint | Behavior |
| --- | --- |
| `GET /api/health` | Reports the browser-facing service, access, pause, and account state |
| `GET /api/conditions` | Returns wind, temperature, and elevation for a position and target from Open-Meteo |
| `POST /api/access` | Exchanges or clears the shared access code using an `HttpOnly` cookie |
| `POST /api/voice-agent` | Accepts transcript, round state, and optional client metadata; returns a structured action |
| `POST /api/transcribe` | Accepts recorded audio and returns a transcript |
| `GET /api/golfapi/clubs[/:id]` | Proxies club search or details |
| `GET /api/golfapi/courses[/:id]` | Proxies course data |
| `GET /api/golfapi/coordinates[/:id]` | Proxies mapped course points |
| `POST /api/account/login-link` | Emails (or logs) a single-use sign-in link |
| `GET /signin?token=` | Shows a confirmation page without setting a cookie |
| `POST /signin` | Redeems a confirmed sign-in link and sets the session cookie |
| `GET /api/account` | Reports whether this device is signed in, and the golfer's name |
| `POST /api/account/name` | Updates the name the caddie uses for the signed-in golfer |
| `POST /api/account/sync` | Pushes device data and returns the merged account data |
| `GET /api/account/export` | Downloads everything in the account as JSON |
| `DELETE /api/account` | Deletes the account and all personal rows |
| `POST /api/account/signout` | Clears the session |
| `GET /api/admin/usage` | Reports today's server-wide usage against the ceilings (admin token required) |
| `POST /api/admin/usage` | Pauses or resumes the paid endpoints (admin token required) |
Voice-agent JSON bodies are limited to 256 KiB and audio bodies to 12 MiB. OpenAI and GOLFAPI credentials are used by the backend for upstream requests.

### Access Control and Rate Limits

`/api/voice-agent`, `/api/transcribe`, and the GOLFAPI proxy require an access grant when `APP_ACCESS_TOKEN` is set. The browser submits the code once to `/api/access` and receives an `HttpOnly`, `SameSite=Lax`, `Secure` cookie containing a one-way digest, not the shared code. Programmatic clients can still send the code in `X-App-Token`. A missing or wrong grant returns `401` with `code: "access_code_required"`. `/api/health` stays open but exposes no model or provider-key details.

Daily budgets are per golfer and survive a restart. When a database is configured, each paid call claims an allowance from the `usage_counters` table in one transaction: one row for the caller - the signed-in account, or a hashed device identifier when signed out - and one for the server-wide ceiling. A request rejected by the ceiling does not spend a personal call. Because the counters live in Postgres, a redeploy, a sleeping free instance, or a second web process cannot hand the same allowance out twice; without a database, or if it stops answering, the server falls back to in-memory counters rather than allowing requests through uncounted. Raw addresses are never stored: a signed-out device is identified only by a SHA-256 digest.

Short-window burst limits stay in memory by design, since they guard a five-minute window and must answer without a database round trip. Defaults are 30 AI requests per five minutes and 400 per day; 60 GOLFAPI requests per five minutes and 600 per day; 40 conditions requests per five minutes and 400 per day; and 12 account/auth requests per 15 minutes and 60 per day. Exceeding a limit returns `429`, and a signed-in golfer who hits their own daily limit is told it is theirs rather than the server's. `TRUSTED_PROXY_HOPS` must match the deployment; forwarded addresses are ignored by default so a direct client cannot rotate a forged `X-Forwarded-For` value.

The GOLFAPI proxy forwards only the query parameters the app uses, limits identifiers and response size, requires valid JSON, and caches successful responses in memory: 30 minutes for club searches, 12 hours for course and coordinate data, and 10 minutes for weather, capped at 120 entries and 1 MiB per entry. The browser also caches a loaded course bundle for the session and holds conditions for ten minutes. Open-Meteo needs no key and is free; its limits exist to be a good neighbour to that service.

Each AI-first voice request can incur OpenAI usage; recorded-audio transcription can incur separate usage. Reusing locally saved targets permits GPS calculations without refetching the course.

### Spending Ceilings and the Kill Switch

Per-client limits stop one device from flooding the server; they do not cap the bill. Two server-wide daily ceilings do that: `AI_GLOBAL_DAILY_LIMIT` (default 1500) across `/api/voice-agent` and `/api/transcribe`, and `GOLFAPI_GLOBAL_DAILY_LIMIT` (default 2000) across the proxy. When a ceiling is reached, further calls return `429` with `code: "server_budget_reached"` until midnight UTC, and the app says so instead of failing vaguely. `GET /api/admin/usage` reports whether the counters are coming from the database or memory, plus how many accounts and devices spent anything today. Scoring, the scorecard, GPS distances, and saved course data keep working the whole time, because they never touch the server.

The kill switch pauses all paid endpoints at once. Set `API_PAUSED=true` to start paused, or flip it at runtime without a redeploy:

```bash
ADMIN=$ADMIN_TOKEN
BASE=https://golf-assistant-prototype.onrender.com

# What has today cost so far?
curl -s -H "x-admin-token: $ADMIN" "$BASE/api/admin/usage"

# Stop spending immediately
curl -s -X POST -H "x-admin-token: $ADMIN" -H "Content-Type: application/json" \
  -d '{"paused":true,"reason":"investigating usage"}' "$BASE/api/admin/usage"

# Resume
curl -s -X POST -H "x-admin-token: $ADMIN" -H "Content-Type: application/json" \
  -d '{"paused":false}' "$BASE/api/admin/usage"
```

`/api/admin/usage` returns `404` when `ADMIN_TOKEN` is unset and `401` without a matching `x-admin-token` header. `/api/health` reports `paused` so the app can show a banner. Counters and the paused flag live in server memory: a restart clears the counters and reverts to the `API_PAUSED` environment value, so treat a runtime pause as temporary and set the variable in Render for anything lasting.

### Static File Serving and Browser Security

The server does not serve arbitrary files from the project directory. It serves only `index.html`, `app.js`, `style.css`, `manifest.webmanifest`, `service-worker.js`, `privacy.html`, `terms.html`, and files directly inside `icons/` with a known asset extension.

Every other request path returns `404 Not found`, including `.env`, `.env.example`, backend source, package metadata, dot-directories, and encoded traversal attempts. `.gitignore` controls Git tracking only; the allowlist is the HTTP access control. Responses also set a restrictive Content Security Policy, frame denial, MIME sniffing protection, a no-referrer policy, a limited Permissions Policy, and HSTS.

### Accounts and Sync

Accounts are optional and controlled by `DATABASE_URL`. Leave it unset and the app runs in device-only mode: sign-in controls are hidden, no saved data is synced, and every local feature still works. Set it and `/api/health` reports `accountsEnabled: true`, enabling the account controls in Settings.

Sign-in is passwordless. `POST /api/account/login-link` stores only a SHA-256 hash of a single-use token that expires in 15 minutes. Opening the link shows a confirmation page; only its same-site `POST /signin` action redeems the token. Redemption creates a fresh session and sets an `HttpOnly`, `SameSite=Lax`, `Secure` cookie for 90 days. Sessions are hashed in the database. Production sign-in URLs come only from `PUBLIC_BASE_URL`, preventing Host-header link poisoning.

Email delivery has exactly three outcomes. With `RESEND_API_KEY` and `LOGIN_EMAIL_FROM` set, the link is emailed through Resend with a 15-second timeout. If that send fails, the request returns `502` and the link is discarded, because a sign-in link is a bearer credential and must never be written where the requester cannot reach it. With neither variable set, the server runs in solo-testing mode and writes the link to its own log, which the response states plainly.

The phone stays the source of truth during a round. Sync is push-then-pull and runs when the app loads and when a round finishes. Finished rounds, shots, club distances, and saved courses upload; the active round does not. Imported and synchronized values are type-, size-, and range-normalized before use.

| Table | Scope | Holds |
| --- | --- | --- |
| `users`, `sessions`, `login_links` | per user | email, hashed tokens, timestamps |
| `rounds` | per user | finished rounds with scores, pars, and per-hole stats |
| `shots` | per user | club, distance, result, lie, miss direction |
| `club_distances` | per user | carry distance per club |
| `courses` | per user | pars, tee lengths, green targets, hazards |

Rounds, shots, and courses use `(user_id, id)` primary keys, so one account cannot overwrite or reserve another account's client-generated IDs. Sync writes are transactional and bounded. `DELETE /api/account` removes the user and cascades through sessions, rounds, shots, club distances, and courses. `GET /api/account/export` returns the account data as JSON. Neither operation changes the browser copy.

Schema creation and ownership migration run idempotently at startup. Remote PostgreSQL certificates are verified by default; `DATABASE_CA_CERT` supports a private certificate authority, while localhost connections can run without TLS.

## Repository Guide

| File | Role |
| --- | --- |
| `index.html` | Screens, forms, navigation, and app structure |
| `style.css` | Design tokens, light/dark themes, and all screen styling |
| `app.js` | Round state, UI, speech, action validation, GPS, conditions, statistics, course loading, and local storage |
| `server.mjs` | Static hosting, environment loading, OpenAI calls, schema, transcription, GOLFAPI proxy, and account routes |
| `db.mjs` | Postgres pool, table creation, sign-in tokens, sessions, sync queries, and durable usage counters |
| `package.json` | Project metadata and start/dev scripts |
| `.env.example` | Environment-variable template without credentials |
| `.gitignore` | Excludes local `.env`, dependencies, and selected logs |
| `.gitattributes` | Pins text files to LF line endings |
| `render.yaml` | Render service configuration for reference and validation |
| `manifest.webmanifest` | PWA name, appearance, launch path, and icons |
| `service-worker.js` | Network-first asset caching with offline fallback |
| `privacy.html` | Privacy policy served by the app |
| `terms.html` | Terms of use served by the app |
| `icons/` | App icon assets |
| `make-icons.html` | Icon-generation helper |

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `EADDRINUSE` on port 3000 | Another process already owns the port. Reuse the running app server or stop the identified old process; alternatively change `PORT` and restart. |
| Phone cannot load local app | Same Wi-Fi, correct computer IPv4 and port, running server, and network/firewall access. Use Render for remote use. |
| Voice unsupported or `not-allowed` | Use HTTPS on the phone, check browser microphone permission and device permission, and confirm recording/speech support. |
| Only part of speech appears | Wait for capture to complete, inspect the transcript, and try the recording flow when browser speech recognition is unreliable. |
| AI unavailable or backup parser used | Check Render/local logs, key configuration, provider account access, internet connectivity, and request timeout. |
| GOLFAPI returns unauthorized | Check the GOLFAPI key in the backend environment and restart/redeploy after correcting it. |
| Hole lengths unavailable or all pars show 4 | Reload the course from GOLFAPI; an old setup may lack details. Check whether the selected course/tee has data. |
| Asked to save a green target | Reload course coordinates or enter a center target manually. Allow location access for GPS calculations. |
| Old interface after deployment | Confirm Render deployed the new commit, close/reopen the app, and refresh. If necessary clear site cache, preserving exported course data first. |
| Club recommendation seems generic | Add carry distances under **Settings → My Club Distances**, or log at least three shots with a club so its distance is learned. |
| `401` or an access-code message | Save the server's `APP_ACCESS_TOKEN` value under **Settings → Server Access**. A provider-key failure shows a different message. |
| `429` or "too many requests" | A per-client window or daily limit was reached. Wait, or raise the limits in the server environment. |

## Verification and Remaining Work

There is no permanent automated test suite configured in `package.json`. Development checks include JavaScript syntax checks, `npm audit`, Git whitespace checks, endpoint and browser smoke tests, mock-provider tests, and disposable real-PostgreSQL isolation tests.

The October 2026 security pass verified: private paths return `404`; login links require a user-confirmed POST; cross-site account mutations return `403`; access grants use an `HttpOnly` cookie and legacy browser storage is removed; CSP and related headers are present; forwarded-address spoofing cannot evade direct-server rate limits; malformed, oversized, and cache-busting GOLFAPI requests are rejected; sign-in URLs fail closed without a configured production base; imported hazards render as text; sign-in URLs are not service-worker cached; two real database users can store identical client IDs without collision; and account deletion cascades through every personal table. `npm audit --omit=dev` reported no known dependency vulnerabilities at that check.

Useful checks from the repository root:

```powershell
node --check app.js
node --check server.mjs
node --check service-worker.js
git diff --check
```

Before expanding beyond prototype testing, remaining work includes:

- A real mapped hole view. The app shows distances, not course layouts.
- Pin position, which no data source here provides, and a ball flight model better than the per-condition rules of thumb the caddie uses now.
- Streaming or Realtime conversation for smoother voice interaction.
- Conversation memory and richer conflict handling for accounts syncing offline changes.
- Course rating and slope, which a real Handicap Index requires; the app shows an estimate against par instead.
- A spending cap measured in money rather than requests, and alerting when a ceiling is reached.
- Broader automated tests, native store packaging, and final commercial/provider-license review.

Sign-in email delivery is implemented but unconfigured on the live service: without `RESEND_API_KEY` and `LOGIN_EMAIL_FROM`, links are written to the server log, which only works while the operator is the only tester.

The app does not collect a centralized dataset of conversations. With an account, finished rounds, courses, club distances, and shot history sync to PostgreSQL; without one, they remain in browser storage. An account also stores the golfer's name and email address. Voice transcripts and current-round context are sent to OpenAI for each AI request, and audio is sent for transcription when that fallback is used. The server sends an approximate position to Open-Meteo for weather and elevation, rounded to about 100 m and never accompanied by any identifier. Smart glasses, scheduled autonomous improvements, and email reports remain future ideas, not implemented features.
