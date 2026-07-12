# Code Structure and Contribution Rules

## Architecture

The backend uses three logical layers inside the current projects:

- `HomeStay.Presentation`: React boundary, ASP.NET controller, HTTP request/response contract, routing, and composition.
- `HomeStay.Application/BusinessLogic`: use-case controls and business entities.
- `HomeStay.Application/DataAccess`: DB classes, SQL connection/session, and SQL scripts.

Use the existing folder and namespace patterns. Do not recreate removed `HomeStay.Domain`, `HomeStay.BusinessLogic`, or `HomeStay.DataAccess` projects.

## Use-Case Flow

- Create one control class for one cohesive use case. A control can have several methods when they support the same screen/workflow.
- A control coordinates business entities. Do not import or call `*DB` directly from a control.
- A business entity owns state, validation, and persistence behavior for itself. If an entity aggregates a DB class in a class diagram, provide entity methods that call that DB class.
- DB classes perform Dapper/SQL work only. They return business entities and do not return React/UI DTOs.
- Keep HTTP DTOs in `HomeStay.Presentation/Contracts`. Do not let a controller create business state or decide business status.
- Keep `PhienDuLieu` inside the use-case transaction boundary. Do not add connection, transaction, or session parameters to business methods.
- Preserve existing schema and status values unless the task explicitly includes a migration. Make migrations idempotent for an existing local database and update fresh-schema scripts too.

## Frontend

- A React route must render a page/workspace or redirect to a canonical route. Never leave `Hello "/..."` placeholders.
- Keep browser HTTP calls at the presentation boundary. Do not mirror backend entities into frontend state solely to bypass an API contract.
- Reuse the existing shell, role guard, UI primitives, form validation, and feature workspace before creating a parallel pattern.
- Use Vietnamese non-accented names for new use-case classes, entities, methods, and boundary state when that is the local convention. Do not rename shared frontend types without a scoped migration.

## Consistency Review

For every use-case change, trace each important operation through:

```text
Boundary event -> control method -> entity behavior -> DB method -> schema/state
```

Resolve a mismatch at its source. Do not alter a diagram merely to hide a code path that contradicts the intended architecture.

## Git Workflow

- Inspect `git status`, `git branch -vv`, and the relevant commit graph before switching, rebasing, merging, or restoring work.
- Preserve unrelated dirty changes. Use `git stash push -u` before a branch move when untracked work exists.
- Push a feature commit before merging its branch into `develop`.
- Do not use `git reset --hard`, destructive checkout, or force-push unless the user explicitly asks for it.
- Keep commits scoped to one contribution. Build and test before committing when practical.

## Verification

Run the narrowest meaningful verification first, then widen for shared behavior:

- Backend changes: `dotnet build` and affected `dotnet test`.
- Frontend changes: `npm run build`; run `npm run typecheck` and distinguish existing baseline errors from introduced ones.
- Any manual edit: `git diff --check`.
