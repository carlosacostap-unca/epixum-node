# Route compatibility inventory

The cohort-scoped namespace is the canonical navigation contract. Historical global URLs remain only as server redirects or narrowly scoped authoring adapters so saved links continue to work without exposing records from another cohort.

| Historical entry point | Canonical destination | Resolution |
| --- | --- | --- |
| `/sprints` | `/cohorts/{cohort}/sprints` | Historical cohort |
| `/sprints/{sprint}` | `/cohorts/{cohort}/sprints/{sprint}` | Sprint owner |
| `/classes/{class}` | `/cohorts/{cohort}/classes/{class}` | Week or sprint parent |
| `/assignments/{assignment}` | `/cohorts/{cohort}/assignments/{assignment}` | Week or sprint parent |
| `/teams`, `/teams/view`, `/teams/restructure`, `/my-team` | `/cohorts/{cohort}/teams` | Historical cohort |
| `/teams/view/{team}` | `/cohorts/{cohort}/teams?team={team}` | Team owner |
| `/reviews` | `/cohorts/{cohort}/reviews` | Historical cohort |
| `/reviews/{sprint}` | `/cohorts/{cohort}/reviews/{sprint}` | Sprint owner |
| `/reviews/detail/{review}` | `/cohorts/{cohort}/reviews/appointments/{review}` | Review sprint owner |
| `/inquiries`, `/inquiries/new` | Same suffix below `/cohorts/{cohort}/inquiries` | Historical cohort |
| `/inquiries/{inquiry}` | `/cohorts/{cohort}/inquiries/{inquiry}` | Inquiry owner |
| `/dashboard`, `/dashboard-cursada` | `/cohorts/{cohort}/dashboard` | Historical cohort |
| `/dashboard/{sprint}/{view}` | `/cohorts/{cohort}/dashboard?period={sprint}&detail={view}` | Sprint owner |
| `/student-form` | `/cohorts/{cohort}/survey` | Historical cohort |

Query parameters are preserved unless they are migration-only. Entity routes derive the cohort from the persisted record and reject conflicting cohort hints. The global sprint, class, and assignment implementations may still be reached with the private `manage=1` adapter while authoring forms are migrated; application navigation never emits those URLs.
