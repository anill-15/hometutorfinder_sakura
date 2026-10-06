# Home Tutor Finder

A working demo of a home-tutor marketplace, built as a college project.
Students and parents can search and compare tutors, save favourites, post tuition
requirements and send requests. Tutors can publish a profile, set availability and
apply for work. An administrator can verify tutors and moderate content.

**Everything runs in the browser.** There is no backend, no database server and no
external service — the database is the browser's `localStorage`.

---

## Description

Finding a home tutor usually means asking around, comparing WhatsApp messages and
guessing whether a profile is genuine. This demo models a marketplace where the
information a family actually needs — fees, qualifications, weekly availability and
reviews tied to completed sessions — sits on one page, and where the whole request
history is visible from `pending` through to `completed`.

It is a **front-end demo**. Authentication, payments, email, SMS and file storage are
deliberately out of scope so the focus stays on the tutor-finding workflow.

---

## Features

### Public
- Landing page with hero search, subject shortcuts, featured tutors, how it works,
  why choose us, testimonials and calls to action
- Tutor directory at `/tutors` with full search, filtering and sorting
- Tutor profiles with qualifications, fees, availability, rating breakdown and reviews
- Public board of open tuition requirements at `/requirements`
- About and contact pages

### Student / parent
- Search and filter tutors (subject, class, city, locality, fee range, experience,
  teaching mode, language, minimum rating, verified only)
- Sort by rating, experience, lowest fee, highest fee or newest
- Save tutors to favourites
- Post, edit, close and delete tuition requirements; review and accept applications
- Send tuition requests and request demo classes
- Track every request with a status timeline; cancel a pending request
- Review a tutor after a completed session
- Profile page with class, subjects, budget, preferred mode and schedule, which drive
  the "why this tutor matches you" explanations

### Tutor
- Create and edit a profile: headline, about, subjects, classes, qualifications,
  experience, fees, city, locality, teaching modes and languages
- Publish weekly availability (per-day start and end times)
- Browse open student requirements, filter them and apply with a message and fee
- Track submitted applications and withdraw them
- Accept, decline or complete student requests and demo requests
- View reviews and rating breakdown

### Administrator
- Dashboard statistics: users, students, tutors, verified tutors, pending
  verifications, open requirements, active requests, completed sessions, average
  rating, open reports
- Search, filter, suspend and restore accounts
- Verify tutors or remove verification, with a note sent to the tutor
- Browse requirements, requests and reviews; delete an inappropriate review
  (ratings recalculate immediately) and view request timelines
- Triage reports: reviewing, resolved or dismissed

### Throughout
- In-app notifications for requests, applications, reviews and verification,
  with unread count, mark-as-read and mark-all-read
- Role-based route protection for student, tutor and admin areas — enforced by the
  router, not only by hiding navigation links
- Friendly inline errors, confirmation dialogs and toast messages — no `alert()` dialogs
- Empty states and responsive layouts for desktop, tablet and mobile

Every read and write is synchronous against `localStorage`, so the app has no
loading spinners to show: a page is either rendered with its data or showing an
error or empty state.

---

## Technology

| Purpose      | Choice                                    |
| ------------ | ----------------------------------------- |
| UI           | React 18                                  |
| Build tool   | Vite 7                                    |
| Routing      | React Router 7                            |
| Language     | JavaScript (JSX)                         |
| Styling      | Plain CSS with design tokens             |
| State        | React Context + service modules          |
| Persistence  | Browser `localStorage`                   |

No UI framework, no state library, no backend, no external API.

---

## Installation

Requires **Node.js 20.19+ or 22.12+** (what Vite 7 needs).

```bash
cd client
npm install
npm run dev
```

Then open the URL printed by Vite, usually <http://localhost:5173>.

On first launch the app seeds demo data automatically. There is nothing else to set
up — no database to create, no environment variables, no migrations.

### Other commands

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

---

## Demo accounts

| Role    | Email               | Password     | What to try |
| ------- | ------------------- | ------------ | ----------- |
| Student | `student@demo.com`  | `student123` | Search tutors, favourite, request a demo, post a requirement, review a session |
| Tutor   | `tutor@demo.com`    | `tutor123`   | Accept a pending request, complete it, apply to requirements, set availability |
| Admin   | `admin@demo.com`    | `admin123`   | Verify a tutor, suspend a user, moderate reviews, triage reports |

The sign-in page lists these accounts and fills the form when you click one.

### Other seeded accounts

Nine more students (`rahul.d@example.com`, `sneha.k@example.com`, …) and fifteen more
tutors (`anita.sharma@demo.com`, `rohit.verma@demo.com`, …) exist so lists are not
empty and so filtering has something to filter. Every seeded student signs in with
`student123` and every seeded tutor with `tutor123`.

---

## Data Storage

The browser's `localStorage` **is** the database. All access goes through
`src/utils/storage.js`; no component touches `localStorage` directly.

Collections, all namespaced with an `htf_` prefix:

| Key                   | Contents |
| --------------------- | -------- |
| `htf_users`           | Accounts (role, contact, status) plus the student's learning preferences |
| `htf_tutors`          | Tutor profiles linked to a user by `userId`, including weekly availability |
| `htf_requirements`    | Tuition requirements posted by students |
| `htf_applications`    | Tutor applications against a requirement |
| `htf_requests`        | Tuition and demo requests, with a status timeline |
| `htf_reviews`         | Reviews linked to a completed request |
| `htf_favorites`       | Student → tutor saves |
| `htf_notifications`   | Per-user notifications with read state |
| `htf_reports`         | Profile reports and their resolution state |
| `htf_subjects`        | Subject reference data (cities are compiled in, not stored) |
| `htf_currentUser`     | The signed-in session (`{ id, role }`) |

Records reference each other by id (`tutor.userId`, `request.studentId`,
`review.requestId`, `favorite.tutorId`), so nothing large is duplicated.

The seed runs only when `htf_users` is missing, empty or unreadable — reloading never
duplicates or overwrites data. **Student Profile → Reset demo data** clears every
`htf_` key and restores the original dataset, which is useful for re-running the
workflows. Clearing site data does the same thing by hand.

Passwords are stored in plain text on purpose. This is a browser-only demo, not a
security model.

---

## Project Structure

```
client/
├── index.html
├── vite.config.js
├── package.json
├── TODO.md
├── README.md
└── src/
    ├── main.jsx                     entry point, mounts <App/> in providers
    ├── App.jsx                      all routes
    ├── index.css                    design tokens + layout primitives
    ├── assets/
    │   └── logo.svg                  brand mark (navbar, footer, favicon)
    ├── styles/
    │   └── components.css           header, hero, cards, dashboards, modals
    ├── context/
    │   └── AuthContext.jsx          current user, login/logout/register
    ├── hooks/
    │   └── useToast.js              toast queue used by every write action
    ├── utils/
    │   ├── storage.js               localStorage wrapper (getData/setData/addItem/…)
    │   ├── helpers.js               formatting, constants, small utilities
    │   ├── lookups.js               city / subject name resolution
    │   └── seedData.js              demo dataset, written on first launch
    ├── services/                    all localStorage logic lives here
    │   ├── authService.js           register, login, logout, profiles
    │   ├── tutorService.js          profiles, search, favourites, availability, matching
    │   ├── requirementService.js    requirements and applications
    │   ├── requestService.js        requests and status transitions
    │   ├── reviewService.js         reviews and rating calculation
    │   ├── notificationService.js   notifications
    │   ├── reportService.js         reports
    │   └── adminService.js          statistics and moderation
    ├── layouts/
    │   ├── PublicLayout.jsx
    │   ├── DashboardShell.jsx       shared sidebar + content area
    │   ├── StudentLayout.jsx
    │   ├── TutorLayout.jsx
    │   └── AdminLayout.jsx
    ├── components/
    │   ├── common/                  Navbar, Footer, Avatar, RatingStars, StatusBadge,
    │   │                            Modal, ConfirmDialog, EmptyState, FormInput,
    │   │                            SelectInput, NotificationBell, Pagination,
    │   │                            ProtectedRoute, RoleRoute, ToastRegion, Icons
    │   ├── tutor/                   TutorCard, SearchBar, FilterPanel, RequestModal,
    │   │                            AvailabilityEditor
    │   ├── student/                 RequestCard, RequirementCard
    │   └── admin/                   DataTable (shared responsive table)
    └── pages/
        ├── public/                  Home, Tutors, TutorDetail, Requirements, About,
        │                            Contact, Login, Register, NotFound
        ├── shared/                  Notifications (used by student and tutor)
        ├── student/                 Dashboard, Profile, FindTutors, Favorites,
        │                            Requirements, NewRequirement, RequirementDetail,
        │                            Requests, Notifications
        ├── tutor/                   Dashboard, Profile, Availability, Requirements,
        │                            Applications, Requests, Reviews, Notifications
        └── admin/                   Dashboard, Users, Tutors, Requirements, Requests,
                                     Reviews, Reports
```

### How the layers fit together

```
page/component  →  service function  →  storage utility  →  localStorage
```

- **Pages** only handle presentation and form state. They never read or write storage.
- **Services** own all rules: what is a valid transition, who may perform it, what a
  notification says. They return `{ ok, error }` instead of throwing, so pages can show
  the message inline.
- **storage.js** is the only module that knows about `localStorage`.

This keeps the UI free of business rules and means the storage layer could be swapped
for a real API later without rewriting the pages.

---

## Main Workflows

### Workflow A — student finds and contacts a tutor
1. Sign in as `student@demo.com`
2. `/student/tutors` → search or filter (subject, class, city, fee range, rating…)
3. Open a tutor profile at `/tutors/:id`
4. Tap the heart to save the tutor
5. Send a tuition request or request a demo class
6. Track it under `/student/requests`; cancel while it is still pending

### Workflow B — tutor handles a request
1. Sign in as `tutor@demo.com`
2. `/tutor/requests` → the pending request is at the top
3. Accept it (or decline with a short reason)
4. After the session, mark it complete
5. `/tutor/reviews` shows any reviews received

### Workflow C — review updates the rating
1. Sign in as `student@demo.com`
2. `/student/requests` → filter by **Completed**
3. Press **Leave a review**, choose 1–5 stars, add a comment
4. Sign in as `tutor@demo.com` → `/tutor/reviews`, or open the tutor's public
   profile: the average rating and review list have already updated

### Workflow D — requirement, application, assignment
1. Student: `/student/requirements/new` → post a requirement
2. Tutor: `/tutor/requirements` → it appears (subject matches sort first) → **Apply**
3. Student: `/student/requirements` → open the requirement → **Accept & assign**
4. The requirement becomes *Assigned* and both sides are notified

### Workflow E — admin
1. Sign in as `admin@demo.com`
2. `/admin/dashboard` → statistics and anything needing attention
3. `/admin/tutors?filter=pending` → **Verify** a tutor (they are notified)
4. `/admin/users` → search and suspend or restore an account
5. `/admin/requests` → open a request to read its timeline
6. `/admin/reviews` → remove an inappropriate review
7. `/admin/reports` → mark a report reviewing, resolved or dismissed

---

## Limitations

This is a demo, and these are deliberate:

- **Data is per browser.** Each browser profile and device has its own dataset.
  Clearing site data resets the demo. There is no shared database.
- **No real authentication.** Passwords are plain text and stored in `localStorage`.
  Role checks only protect the UI — anyone can edit `localStorage` by hand.
- **No email, SMS or push notifications.** Notifications live inside the app only.
- **No payments or scheduling.** Fees are displayed, never charged, and sessions are
  not booked on a calendar.
- **No chat or calls.** Communication is limited to the request message and the
  decline note.
- **Avatars are generated initials**, so there is no image upload.
- **Matching is simple and explainable**, not smart: it compares the saved student
  preferences with each tutor's real profile fields and lists the reasons.
- **Data is not encrypted** and is visible to anyone using the same browser profile.