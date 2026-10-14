# Golf Assistant

Golf Assistant is a phone-friendly golf scorekeeper and voice caddie built collaboratively by Drake Parsons and Codex. It combines manual round controls, natural-language AI, course data from GOLFAPI, and GPS distances in a browser app that can be added to a phone's home screen.

The project began as a manual scorecard prototype. Our work has expanded it into an AI-assisted on-course experience with a redesigned mobile interface, a Node backend, live course-data loading, voice capture, spoken responses, and initial club recommendations.

**Current stage:** a working prototype for field testing. It is a progressive web app (PWA), not yet a native App Store or Google Play release. Smart-glasses integration is deferred.

## What We Have Built

### Mobile Interface and Navigation

- A golf-themed home screen with a primary **Start Round** button and shortcuts to the course library, yardage, scorecard, active round, and settings.
- A separate round-setup page for entering course and player information or loading a saved course. Setup and the course library no longer fill the home page.
- A home button that changes to **See Current Round** when a round is active.
- Bottom navigation between Home, Scorecard, Yardage, Round, and More.
- An active-round dashboard showing the course, current hole, par, available hole length, score inputs, a shot log, and the voice caddie.
- A vertical scorecard intended for phone screens, with totals, scores relative to par, and leader information.
- Collapsible green-coordinate and hazard editors. The course-save controls remain directly accessible.
- A conversation-style caddie panel showing user speech, responses, and processing status.
- A Settings screen with the server access code, the club-distance editor, and shot-history controls.

Some visual controls are prototype placeholders. The decorative hole map is an illustration; it does not render the actual layout of the selected course.

### Round Management and Scoring

- Start a 9- or 18-hole round with named players.
- Enter and save scores manually or through natural speech.
- Correct an existing score for a named player and hole.
- View totals, the current leader, and performance relative to par.
- Move to the next, previous, or a specified hole.
- Edit the current hole's par.
- End a round manually with **End Round** or through the voice agent.
- Reset a round and restore saved round state after reloading the app.

Voice action handlers validate player names, scores from 1 through 20, holes within the round, and pars from 3 through 6 before applying those actions.

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

GPS calculations run in the frontend. A mapped point is required to calculate its distance. Distances are straight-line estimates based on coordinates, not slope-adjusted playing distances or walking routes.

### Caddie and Club Recommendations

Club questions have a dedicated `recommend_club` action so they are handled as shot advice. The backend receives the current hole's par, length, green target, hazards, and the golfer's club distances.

Recommendations can use a spoken distance or, when available, GPS distance to the center of the green. Responses include a club, target, preferred miss, hazard advice, and reasoning.

Club choice is personal when data exists. The app picks the shortest club that still covers the distance from the golfer's own distances, and only falls back to the general chart when no personal data exists. The spoken reason states where the number came from: a saved profile distance or a learned distance from logged shots.

Wind, weather, elevation, lie, and pin location are still not fetched, so advice remains a starting estimate for those conditions.

### Personal Club Distances and Shot Learning

Settings has a club-distance editor. Each row is a club name and a carry distance between 20 and 400 yards; rows left blank are ignored. Saved distances are stored in `golfPlayerClubProfile` and sent to the AI agent as round context.

The Active Round screen has a shot log. Each entry records club, distance, result (carried as planned, short, or long), lie, course, and hole. A club's distance is learned from the median of its shots marked "carried as planned" once it has at least three of them, and a learned distance overrides the manually saved one for that club. Shot history can be exported as JSON or cleared in Settings. The log keeps the most recent 500 shots.

After a club recommendation, the shot-log club and distance fields are prefilled so logging the shot takes one tap.

### Persistence and Installable Web App

- `golfRound` stores round state in browser local storage.
- `golfCourseSetups` stores the local course library.
- `golfPlayerClubProfile` stores the club-distance editor's values.
- `golfShotLog` stores logged shots and drives learned club distances.
- `golfAppAccessToken` stores this device's server access code.
- A web manifest and icons support adding the app to a phone's home screen.
- The service worker serves network-first with a cached fallback, so a new deployment is picked up on the next load while cached assets still support offline use.
- API requests bypass the service worker entirely.

There is no shared database, sign-in, or cross-device sync yet. Data saved on one browser does not automatically appear on another device. Clearing browser storage can remove rounds and courses. Export course setups to retain a separate copy. Cached frontend assets can support some offline use, but OpenAI and live GOLFAPI requests require internet access.

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
```

The backend uses Node's built-in HTTP server and `fetch`; it does not currently use Express or third-party npm dependencies. Frontend code is plain HTML, CSS, and JavaScript.

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
   APP_ACCESS_TOKEN=choose_a_long_random_access_code
   ```

   `APP_ACCESS_TOKEN` is the shared access code for the API endpoints. When it is set, the app will not reach OpenAI or GOLFAPI until the same code is saved under **Settings → Server Access** in the browser. Leaving it blank keeps the endpoints open, which is only appropriate for local use on a trusted network. The request ceilings in `.env.example` (`AI_WINDOW_REQUEST_LIMIT`, `AI_DAILY_REQUEST_LIMIT`, `GOLFAPI_WINDOW_REQUEST_LIMIT`, `GOLFAPI_DAILY_REQUEST_LIMIT`) are optional overrides.

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

Check [http://127.0.0.1:3000/api/health](http://127.0.0.1:3000/api/health) to see whether the server is running and whether keys are configured. Configuration booleans indicate that values exist, not that provider authentication has succeeded.

## Render Deployment and Phone Testing

The project has been tested using a Render Node web service connected to GitHub.

1. Connect the service to this repository and the intended branch, normally `main`.
2. Set the service root directory to the folder containing `package.json` and `server.mjs`. Leave it blank if those files are at the repository root.
3. Use `npm install` as the build command and `npm start` as the start command.
4. Set `OPENAI_API_KEY`, `GOLFAPI_API_KEY`, `APP_ACCESS_TOKEN`, and any model or rate-limit overrides in Render's environment settings. Keep `HOST=0.0.0.0`; the server reads the port provided by the host.
5. Deploy, then open the service's HTTPS URL on the phone and allow microphone/location access when using those features.

Local edits do not change Render. Commit and push them to the connected branch. If automatic deployment is enabled, Render then builds the new commit; otherwise trigger a manual deployment. Check the deployed commit and deployment status in Render before testing.

For same-Wi-Fi layout testing, use `http://<computer-Wi-Fi-IPv4>:3000` while the local server is running. Phone microphone and location features generally require HTTPS, so the deployed HTTPS site is the appropriate field-test environment. The hosted app does not require the development computer to stay on.

Use the phone browser's home-screen installation option where available. An installed PWA remains a web app, not a native store app.

## Backend Endpoints

| Endpoint | Behavior |
| --- | --- |
| `GET /api/health` | Reports server status, model, key configuration booleans, and whether an access code is required |
| `POST /api/voice-agent` | Accepts transcript, round state, and optional client metadata; returns a structured action |
| `POST /api/transcribe` | Accepts recorded audio and returns a transcript |
| `GET /api/golfapi/clubs[/:id]` | Proxies club search or details |
| `GET /api/golfapi/courses[/:id]` | Proxies course data |
| `GET /api/golfapi/coordinates[/:id]` | Proxies mapped course points |

Voice-agent JSON bodies are limited to 256 KiB and audio bodies to 12 MiB. OpenAI and GOLFAPI credentials are used by the backend for upstream requests.

### Access Control and Rate Limits

`/api/voice-agent`, `/api/transcribe`, and the GOLFAPI proxy require the `X-App-Token` header to match `APP_ACCESS_TOKEN` when that variable is set. A missing or wrong code returns `401` with `code: "access_code_required"`, which the app shows as an access-code message rather than a provider error. `/api/health` stays open so the app can report whether a code is needed.

Each client, identified by `X-Forwarded-For` or the socket address, gets a rolling five-minute window limit and a daily limit per endpoint group: 30 per window and 400 per day for the AI endpoints, 60 per window and 600 per day for the GOLFAPI proxy. Exceeding either returns `429` with a `Retry-After` header. Counters live in server memory, so a restart or a second instance resets them.

Successful GOLFAPI responses are cached in server memory, keyed by the full upstream URL: 30 minutes for club searches and 12 hours for course and coordinate data, capped at 120 entries and 1 MiB per entry. Repeating a course load therefore costs no provider quota. The browser also caches each loaded course bundle for the session, so switching between tees or courses does not refetch.

Each AI-first voice request can incur OpenAI usage; recorded-audio transcription can incur separate usage. Reusing locally saved targets permits GPS calculations without refetching the course.

### Static File Serving

The server does not serve arbitrary files from the project directory. It serves only an explicit public allowlist:

- `index.html`, `app.js`, `style.css`, `manifest.webmanifest`, `service-worker.js`, `make-icons.html`
- files directly inside `icons/` with a known asset extension

Every other request path returns `404 Not found`, including `.env`, `.env.example`, `server.mjs`, `package.json`, `.gitignore`, any dot-file or dot-directory such as `.git/`, nested paths outside `icons/`, and encoded traversal attempts like `/..%2F.env`. `.gitignore` controls Git tracking only; this allowlist is the HTTP access control.

## Repository Guide

| File | Role |
| --- | --- |
| `index.html` | Screens, forms, navigation, and app structure |
| `style.css` | Mobile styling, scorecard layout, and caddie conversation presentation |
| `app.js` | Round state, UI, speech, action validation, GPS, course loading, and local storage |
| `server.mjs` | Static hosting, environment loading, OpenAI calls, schema, transcription, and GOLFAPI proxy |
| `package.json` | Project metadata and start/dev scripts |
| `.env.example` | Environment-variable template without credentials |
| `.gitignore` | Excludes local `.env`, dependencies, and selected logs |
| `manifest.webmanifest` | PWA name, appearance, launch path, and icons |
| `service-worker.js` | Network-first asset caching with offline fallback |
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

There is no automated test suite configured in `package.json`. Development checks have included JavaScript syntax checks, Git whitespace checks, local endpoint tests, course-data checks, and manual browser/phone testing.

The access-code, rate-limit, club-distance, shot-learning, and course/tee features were last verified locally against a mock GOLFAPI upstream: wrong or missing codes returned `401` and surfaced an access-code message in the caddie panel; the fifth call past a window limit returned `429`; three 7-iron shots at 158, 162, and 160 yards produced a learned 160-yard carry that overrode the saved 150-yard entry and changed the spoken reason; and selecting the Red tees stored that tee's per-hole lengths. Repeating a course load after a reload made no new upstream requests. These are point checks, not a guarantee for every course or phrase.

Useful checks from the repository root:

```powershell
node --check app.js
node --check server.mjs
node --check service-worker.js
git diff --check
```

Before expanding beyond prototype testing, remaining work includes:

- A real course-map view. The hole graphic is still an illustration.
- Wind, lie, elevation, and other contextual inputs for caddie advice.
- Streaming or Realtime conversation for smoother voice interaction.
- Accounts, durable storage, cross-device sync, and conversation memory. Club distances and shot history live only in the browser that recorded them.
- Per-user credentials and cost monitoring. The current access code is one shared secret with in-memory rate limits, not per-user authentication, and it resets when the server restarts.
- Voice control for logging shots; shots are logged through the Active Round form today.
- Production privacy/data handling, broader tests, and native store packaging.

The current app does not collect a centralized dataset of user conversations. Club distances and shot history stay in the browser's local storage and are sent to OpenAI only as round context for a voice request. Audio is sent for server transcription when that fallback is used. Smart glasses, scheduled autonomous improvements, and email reports were discussed as future possibilities and are not implemented app features.
