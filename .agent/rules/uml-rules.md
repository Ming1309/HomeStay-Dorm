# PlantUML Rules

`docs/uml/lap-phieu-coc-class.puml` and `docs/uml/lap-phieu-coc-sequence.puml` are the canonical visual style and flow reference.

## Class Diagram

- Use three packages: `TANG GIAO DIEN`, `TANG NGHIEP VU`, and `TANG TRUY CAP DU LIEU`.
- Preserve the package colors, top-to-bottom layout, orthogonal lines, and class styling from `lap-phieu-coc-class.puml`.
- Show the screen boundary as `MH...`; do not show HTTP controllers, HTTP DTOs, `PhienDuLieu`, connection, transaction, or framework infrastructure in a use-case class diagram.
- Use aggregation for ownership/coordination:
  - `MH... o-- UseCase`
  - `UseCase o-- BusinessEntity`
  - `BusinessEntity o-- EntityDB`
- Do not put multiplicity labels on an `o--` relation.
- Use ordinary, unoriented lines for associations between business classes. Add multiplicity only when it describes a real domain cardinality.
- List only fields and methods relevant to the use case. Every listed behavior must exist in code or be implemented in the same contribution.

## Sequence Diagram

- Use `boundary` for the screen, `control` for use-case controls and business entities, and `entity` only for DB classes.
- Do not show HTTP controllers, DTOs, `PhienDuLieu`, connection, transaction, commit, rollback, or return arrows.
- Include initial screen loading, user events, validation, entity behavior, and persistence operations that the use case actually performs.
- Use concrete method names and parameters. Do not use ellipses, vague placeholders, nullable `?` notation, or a message that has no corresponding code method.
- Keep the direction physical and one-way: boundary -> control -> entity -> DB. A DB operation must be invoked through its owning business entity when the class diagram models that ownership.

## Diagram-Code Alignment

Before finishing, compare class diagram, sequence diagram, source code, and schema operation by operation. In particular verify:

- Every sequence lifeline has a class in the class diagram.
- Every message names a real method with compatible responsibility.
- Every business-to-DB aggregation has an entity method that reaches that DB class.
- A behavior that belongs to a different use case is not added to the current diagram merely because it shares an entity.
