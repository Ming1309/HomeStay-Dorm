# HomeStay Dorm Contribution Guide

Read these files before changing a use case, backend architecture, React route, or UML artifact:

1. `.agent/RULES.md` for UI and UX conventions.
2. `.agent/rules/contribution-rules.md` for code structure and Git workflow.
3. `.agent/rules/uml-rules.md` before changing PlantUML.

Use `LapPhieuCoc` as the reference implementation:

- `src/HomeStay.Application/BusinessLogic/LapPhieuCoc.cs`
- `docs/uml/lap-phieu-coc-class.puml`
- `docs/uml/lap-phieu-coc-sequence.puml`
- `docs/uml/lap-phieu-coc-code-audit.md`

Before editing, inspect `git status`, the current branch, the closest existing use case, its DB classes, schema, frontend route, and UML. Preserve unrelated worktree changes.

Before finishing, update every affected code and UML artifact together. Run build and tests proportional to the change, then report any baseline failures outside scope.
