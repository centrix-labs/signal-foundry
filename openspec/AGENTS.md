# OpenSpec Instructions

Use OpenSpec changes for planning before implementation.

For each material change:

1. Create a folder under `openspec/changes/<change-id>/`.
2. Include `proposal.md`, `design.md`, `tasks.md`, and capability specs under `specs/`.
3. Keep behavioral requirements in `spec.md`.
4. Keep implementation details and Azure resource choices in `design.md`.
5. Keep delivery sequencing in `tasks.md`.

Spec requirements must use:

- `### Requirement: <Name>`
- Normative `SHALL` statements
- `#### Scenario: <Description>`
- `GIVEN`, `WHEN`, `THEN`, and `AND` bullets

