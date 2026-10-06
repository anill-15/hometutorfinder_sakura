# Home Tutor Finder — TODO

College demo project. React + Vite + React Router + CSS, with browser
`localStorage` as the database. No backend, no external services.

Status legend: `[x]` done **and** tested · `[~]` partial · `[ ]` not started

---

## Phase 1 — Project foundation

- [x] Vite + React scaffold (`index.html`, `vite.config.js`, `package.json`)
- [x] Folder structure: `assets`, `components/{common,tutor,student}`, `pages/{public,student,tutor,admin,shared}`, `layouts`, `context`, `hooks`, `services`, `utils`
- [x] `src/index.css` — design tokens, layout primitives, buttons, cards, forms, tables
- [x] `src/styles/components.css` — header, hero, tutor cards, dashboards, modals, toasts
- [x] `src/utils/storage.js` — `getData`, `setData`, `addItem`, `updateItem`, `deleteItem`, `getAll`, `findById`, `where`, `genId`, `resetAll` (corrupt values are tolerated, never thrown on)
- [x] `src/utils/helpers.js` — formatting, day/time constants, small utilities

## Phase 2 — Demo database

- [x] `src/utils/seedData.js` — 26 subjects, 10 cities, 16 tutors, 10 students
- [x] Seed runs only when data is missing, empty or unreadable (no overwrite, no duplicates)
- [x] Seeded 10 requirements, 9 applications, 20 requests (17 completed), 17 reviews
- [x] Seeded 9 favourites, 18 notifications, 3 reports
- [x] Requirement statuses and assigned tutors derived from their applications, so the
      board, the tutor filters and the student dashboard can never disagree
- [x] Every review points at a real completed request, by the student who made it,
      crediting the tutor who delivered it
- [x] Demo accounts created on first launch (verified all three log in)
- [x] Indian names, INR fees, per-city localities, varied ratings and availability

## Phase 3 — Demo authentication

- [x] `AuthContext.jsx` — `login`, `logout`, `register`, `getCurrentUser`
- [x] Session stored under `currentUser`; survives page refresh
- [x] Roles: `student`, `tutor`, `admin`
- [x] `ProtectedRoute` (signed-in check) and `RoleRoute` (role check wrapping it)
- [x] Suspended accounts blocked at sign-in
- [x] Passwords never exposed by `getCurrentUser`

## Phase 4 — Public website

- [x] `/` home — hero + search, subject shortcuts, featured tutors, how it works, why choose us, testimonials, student CTA, tutor CTA
- [x] `/tutors`, `/tutors/:id`, `/requirements`, `/about`, `/contact`, `/login`, `/register`
- [x] Navbar, footer, mobile nav
- [x] 404 page for unknown routes

## Phase 5 — Tutor discovery

- [x] Search by name / subject / locality
- [x] Filters: subject, class, city, locality, fee min/max, experience, mode, language, rating, verified only
- [x] Sorting: rating, experience, lowest fee, highest fee, newest
- [x] Tutor card: avatar, name, subjects, experience, location, fee, rating, verification badge, teaching mode, favourite + view profile
- [x] Filter state held in the URL query string
- [x] Pagination and a proper empty state

## Phase 6 — Tutor profiles

- [x] Photo, name, verification badge, about, subjects, classes, qualifications
- [x] Experience, fees, location, teaching modes, languages
- [x] Weekly availability table
- [x] Rating summary, star distribution, review list
- [x] Actions: favourite, send request, request demo
- [x] Signed-out visitors redirected to sign-in for actions
- [x] "Why this tutor matches you" box for signed-in students
- [x] Report profile dialog

## Phase 7 — Student system

- [x] `/student/dashboard` — welcome, stats, favourites, requirements, requests, notifications, quick actions
- [x] `/student/profile` — account details + learning preferences, plus reset demo data
- [x] `/student/tutors`, `/student/favorites`
- [x] `/student/requirements`, `/student/requirements/new`, `/student/requirements/:id`
- [x] `/student/requests`, `/student/notifications`
- [x] Everything persists to localStorage

## Phase 8 — Favourites

- [x] Add / remove from card and profile
- [x] Favourites list page
- [x] Persisted in localStorage (`favorites`)

## Phase 9 — Tuition requirements

- [x] Create requirement (subject, class, board, location, budget, mode, days, time, description)
- [x] Statuses: open → applications_received → shortlisted → assigned / closed / cancelled
- [x] Edit, close, delete (with confirmation)
- [x] View and act on applications

## Phase 10 — Tutor requirements & applications

- [x] `/tutor/requirements` — browse + filter open requirements, matching subjects first
- [x] Apply dialog with message and proposed fee
- [x] `/tutor/applications` — track and withdraw applications
- [x] Student view of applications with accept / decline / assign
- [x] Duplicate application and applying to your own requirement blocked

## Phase 11 — Tutor dashboard

- [x] `/tutor/dashboard` — profile completeness, verification, requests, applications, rating, notifications
- [x] `/tutor/requests` — accept, decline with a reason, mark complete, status timeline
- [x] `/tutor/reviews` — rating summary, star distribution, review list
- [x] `/tutor/notifications`

## Phase 12 — Tutor profile management

- [x] `/tutor/profile` — name, headline, about, subjects, classes, qualifications, experience, fees, city, locality, teaching modes, languages
- [x] Verification status read-only for tutors (admin-only changes)
- [x] Account name and location kept in sync with the profile

## Phase 13 — Availability

- [x] `AvailabilityEditor` component — seven days, enable + start/end times
- [x] `/tutor/availability` page wired to it
- [x] Availability rendered on the tutor profile
- [x] End-before-start and empty-schedule validation

## Phase 14 — Request system

- [x] Student sends tutoring / demo request (subject, message, preferred date + time)
- [x] Statuses: pending → accepted / rejected / cancelled → completed
- [x] Transition rules enforced in the service
- [x] Actor rules: only tutors accept/reject/complete, only students cancel
- [x] Duplicate active request blocked
- [x] Status timeline rendered on every request

## Phase 15 — Reviews

- [x] Only completed requests can be reviewed
- [x] One review per request
- [x] Only the student in the request can review
- [x] Average rating recalculated from stored reviews
- [x] Reviews shown on the tutor profile and in `/tutor/reviews`

## Phase 16 — Notifications

- [x] Created for request received / accepted / rejected / cancelled / completed
- [x] Created for application received / accepted / declined
- [x] Created for review received and tutor verified / verification removed
- [x] Unread count badge, mark read, mark all read, clear
- [x] Header bell dropdown + full notification page

## Phase 17 — Admin

- [x] `/admin/dashboard` — eight statistic cards + recent requests + "needs attention"
- [x] `/admin/users` — search, role/status filters, suspend / restore
- [x] `/admin/tutors` — verify / remove verification with a note to the tutor
- [x] `/admin/requirements`, `/admin/requests` (with timeline modal)
- [x] `/admin/reviews` — search, rating filter, delete review
- [x] `/admin/reports` — reviewing / resolved / dismissed

## Phase 18 — Reports

- [x] Report dialog on the tutor profile (five reasons)
- [x] Reports stored in localStorage
- [x] Admin triage page with administrator notes
- [x] Statuses: open / reviewing / resolved / dismissed

## Phase 19 — Reusable components

- [x] Navbar, Footer, Avatar, RatingStars, StatusBadge
- [x] Modal, ConfirmDialog, EmptyState, ToastRegion
- [x] FormInput, TextAreaInput, SelectInput
- [x] ProtectedRoute, RoleRoute (the role guard reads the user from the auth context)
- [x] NotificationBell, Pagination
- [x] TutorCard, SearchInput/SortSelect/FilterToggle, FilterPanel, RequestModal
- [x] RequestCard (+ RequestTimeline), RequirementCard, AvailabilityEditor
- [x] `components/admin/DataTable.jsx` — shared responsive table with stable row keys
- [x] `assets/logo.svg` — brand mark used in the navbar, footer and favicon

## Phase 20 — UI quality

- [x] Design tokens, consistent buttons, cards, forms, status badges
- [x] Empty states on every list
- [x] Toast feedback for every write action
- [x] Modals and inline errors instead of `alert()`

## Phase 21 — Error handling

- [x] Inline field errors on all forms
- [x] Friendly messages for invalid login, duplicate email, missing records
- [x] Protected routes and role guards
- [x] Invalid status transitions blocked with an explanation
- [x] Empty search / favourites / requests / notifications states

## Phase 22 — Responsiveness

- [x] Mobile nav drawer
- [x] Filters become a slide-over panel on small screens
- [x] Sidebar becomes a drawer in dashboards
- [x] Tables become stacked cards on small screens
- [x] Single-column tutor cards on mobile

## Phase 23 — Testing

Automated audit harnesses (kept outside the project, in a temp directory, so no test
artifacts ship with the app):

- [x] 295 data-layer assertions against the real services with a `localStorage`
      shim: seed integrity, referential links, auth, registration, search + filters +
      sorts + pagination maths, favourites, requirements, applications, request
      transitions, reviews, notifications, reports, admin moderation, cross-user
      isolation, corrupt-storage recovery, re-seeding
- [x] 359 browser assertions driving headless Chrome over the DevTools Protocol:
      every route in every auth state, role protection by direct URL, the six demo
      workflows end to end, console/network error capture on every page, empty
      states, unknown ids, corrupt storage, and mobile/tablet/desktop overflow checks
- [x] Both suites pass repeatedly with no flakes

Workflows covered:

- [x] Workflow A — student: search → filter → profile → favourite → request → demo
- [x] Workflow B — tutor: request → accept → complete
- [x] Workflow C — student review → tutor rating updates
- [x] Workflow D — requirement → tutor applies → student accepts and assigns
- [x] Workflow E — admin: dashboard, verify tutor, suspend user, reviews, reports
- [x] Workflow F — logout → sign in as another role → correct dashboard and data

Also verified:

- [x] Production build succeeds (`vite build`)
- [x] `npm audit` reports 0 vulnerabilities; every declared dependency is used
- [x] No console errors, warnings or failed requests on any route
- [x] No horizontal overflow at 390px, 820px or 1440px

## Phase 24 — Final cleanup

- [x] Removed dead exports and unused helpers across services, utils, layouts, icons
- [x] Removed the unused `LoadingState` component (nothing renders asynchronously)
- [x] Removed duplicate service default-export blocks (all imports are namespace imports)
- [x] Removed all unused imports; `npm run build` is clean
- [x] Removed temporary verification scripts (kept outside the project tree)
- [x] `package.json` trimmed to exactly the five packages the app uses
- [x] `.gitignore` present (`node_modules`, `dist`, logs, editor folders)
- [x] No backend, database or API code in the project
- [x] README and this file corrected to match the shipped behaviour

## Phase 25 — Docs

- [x] `README.md` — description, features, tech, install, demo accounts, data storage, structure, workflows, limitations
- [x] `TODO.md` — this checklist

---

## Known limitations (deliberate for a demo)

- Data is per browser profile — no shared database, nothing is synchronised.
- No real authentication: plain-text passwords in `localStorage`, role checks only
  protect the UI.
- No email, SMS, push, payments, scheduling, chat or video.
- Avatars are generated initials; there is no image upload.
- Matching compares saved preferences with profile fields — it is explainable, not smart.
- Every read is synchronous, so there is no loading state to render; a page shows its
  data, an error, or an empty state.
- No automated tests ship with the project. The audit harnesses were run from a temp
  directory and deliberately left out of the tree.