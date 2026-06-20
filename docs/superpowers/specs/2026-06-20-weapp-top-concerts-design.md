Title: weapp - Top Concerts Ranking
Date: 2026-06-20

Summary
- Single-user responsive SvelteKit PWA to track and rank the best concerts you saw in the current year.
- Minimal event model: artist, date, venue. Add events and insert them into a definitive ranked list by asking binary comparisons until insertion position is found.
- Storage: Hybrid (IndexedDB autosave + optional File System Access API Open/Save + Export/Import JSON fallback).

Scope
- Create a SvelteKit app using the latest stable SvelteKit with TypeScript.
- Styling: component-scoped CSS (no Tailwind).
- Core features: add event, interactive ranking (binary-insertion comparisons), export/import, open/save local file (FS API when available), undo, manual reorder, year scoping.

Data model (finalized)
- Event: { id: string, artist: string, date: ISOString, venue: string, createdAt: ISOString, notes?: string }
- Ranking: ordered array of event ids (best → worst)
  - Note: to support ties, the internal representation may be an array of groups (Array<Array<eventId>>) where groups contain one or more event ids tied at the same rank. Presentation will flatten groups when there are no ties.
- Optional comparisons log (separate store): { aId, bId, winnerId|null, timestamp, note? } (for audit/re-ranking later). A null winnerId indicates a tie/Equal answer; a special marker `unsure` can be stored in note.

Comparisons store schema (detailed)
- Purpose: store each explicit comparison made by the user so we can avoid asking duplicate comparisons, detect cycles/inconsistencies, and run re-ranking algorithms later.
- Suggested schema (IndexedDB store "comparisons"):
  - key: auto-generated numeric id or composite key `${minId}|${maxId}|${timestamp}`
  - fields:
    - id: string (uuid)
    - aId: string (event id, canonical direction: as asked)
    - bId: string (event id)
    - winnerId: string|null (id of winner; null = tie/Equal)
    - result: 'a' | 'b' | 'tie' | 'unsure'  // explicit enum for quick queries
    - timestamp: ISOString
    - context?: { sessionId?: string, prompt?: string } // optional UX context
    - note?: string

- Query patterns:
  - find latest comparison between X and Y (regardless of order) -> return most recent or canonicalized result
  - enumerate all comparisons for an event -> used for audits/re-rank

Graph and inconsistency detection
- Maintain an ephemeral directed graph in memory where an edge U -> V means U > V (U ranked better than V). For ties, store undirected grouping information.
- After each new definitive comparison (non-unsure), update the graph and run a cycle detection (DFS/topological attempt).
  - If a cycle is detected, flag inconsistency and start a resolution flow (see UI below).
  - Keep the comparisons store as the source of truth for reconstructing the graph.


Storage
- Primary working store: IndexedDB (via idb library) with autosave on each change.
- Optional file integration: when user opens a local JSON file via the File System Access API, keep the file handle and write back on Save. If FS API unavailable, Open uses file upload and Save uses Export (download) fallback.
- Export/Import JSON: always available for backups and cross-browser compatibility.
- Merge/import rules: import merges by id; user is prompted on conflicts. Opening a file replaces the working store after confirmation unless user chooses to merge.

Ranking flow
- Add event via minimal form (artist, date, venue).
- If ranking empty → event becomes first.
 - Otherwise: perform interactive binary-insertion
   - Compare new event with element at mid index: ask user "Is [new] better than [existing]?" (Yes / No / Equal / Unsure)
     - Yes → new is better than existing (move to upper half)
     - No → new is worse (move to lower half)
     - Equal → treat as tied: place new in the same group as existing (do not split group) and persist a tie comparison (winnerId = null)
     - Unsure → skip recording a definitive comparison; insert conservatively (e.g., favor placing new adjacent to existing) or prompt a secondary comparison strategy
   - Narrow search to appropriate region until insertion position or group is determined.
 - Insert into ranking, optionally record comparison entry, persist to store.
 - Provide undo for last insertion/answer.
 - When Equal responses occur, the ranking representation supports tied groups; UI should visibly indicate ties (e.g., grouped cards with a tie badge).

UI
- Main screen: year selector + ranked list (cards showing artist/date/venue and position).
- Add button opens a modal form for the minimal fields.

Detailed UI flows & behaviors (comparison, add-item, list interactions, responsive)

Comparison modal flow
- Trigger: binary-insertion or targeted conflict resolution.
- Layout:
  - Two stacked or side-by-side cards depending on viewport width (side-by-side on desktop, stacked on mobile).
  - Each card shows adapter.renderPreview output (title/artist/date/venue) and a subtle badge showing its current rank or group.
  - Primary actions as large buttons: "Better" (left -> new is better), "Worse" (right -> new worse), "Equal / Tie", and "Not sure".
  - Secondary actions: "Explain why" (expands a small tooltip), keyboard shortcut hints.
- Flow:
  1. Modal opens and focuses the primary action (Better). Screen reader announces the comparison.
  2. User chooses action. The modal records the result to comparisons store (if definitive), updates in-memory graph, and either narrows the search or inserts the item.
  3. Provide subtle animation to show where the new item will land (e.g., animate a placeholder in the list behind the modal).
  4. After insertion, show a brief toast: "Inserted at #3 — undo".
- Accessibility:
  - Ensure each card has role="article" and an accessible name. Buttons have aria-labels.
  - Keyboard: B/W/E/U for actions, Esc to cancel. Tab order follows primary actions then secondary.

Add-item modal flow
- Trigger: Add button or keyboard shortcut (N for new).
- Layout:
  - Step 1: Choose type (Concert [default], Movie, Book). For MVP hide other types but keep type selector visible for future expansion.
  - Step 2: Type-specific form fields (concert: artist, date picker, venue, optional notes). Validate required fields inline.
  - Bottom actions: "Add and Rank" (primary), "Add Without Ranking" (secondary), "Cancel".
- Flow:
  1. User opens modal, selects type (if not default), fills form, presses Add and Rank.
  2. App creates the Item and starts the binary-insertion flow (comparison modal) immediately for ranking.
  3. If user chooses Add Without Ranking, item is appended to bottom of ranking for that type/year and can be ranked later.
- UX details:
  - Auto-complete suggestions for artist/venue based on existing items.
  - Date picker should default to the current year when relevant.

Ranked list interactions
- Representation:
  - Render ranking as vertical list of groups. Each group shows position number(s), grouped items (if tie), and light controls (drag handle, more menu).
- Actions per item:
  - Drag to reorder (desktop and touch). Dropping two items onto each other offers to create a tie.
  - Context menu: Edit, Delete, Group as tie with selected item, Move to top/bottom, View comparisons.
- Bulk actions:
  - Multi-select mode (Shift+click or long-press) to select multiple items for grouping or bulk delete.
- Visual cues:
  - When an insertion comparison modal is active, show a faint placeholder in the list indicating the current candidate insertion index with an animated pulse.
  - Ties are visually grouped with a tie badge and a subtle connecting line.

Responsive behaviors
- Mobile:
  - Stacked comparison cards, full-screen modal with large touch targets.
  - Add button is a FAB in bottom-right.
  - Drag-and-drop uses long-press and handles with explicit drop targets.
- Desktop:
  - Side-by-side comparison cards in a centered modal, keyboard shortcuts enabled, denser layout for list.
- Tablet / mid-size:
  - Choose layout based on available width; prefer side-by-side when width > 800px.

Keyboard & accessibility details
- Global shortcuts:
  - N: New item (opens add modal)
  - F: Focus search/filter input
  - ?: Open help overlay displaying keyboard shortcuts
- In comparison modal:
  - B: Better, W: Worse, E: Equal, U: Unsure, Esc: Close
- ARIA:
  - Modals trap focus and restore focus to the triggering control on close.
  - Important dynamic updates (insertions, errors) announced via an ARIA live region.
- Contrast and touch target sizes follow WCAG AA at minimum for text and touch targets >= 44px where applicable.

Tie handling in the UI
- Internal representation: ranking is Array<Group> where Group = Array<eventId>. For display, render each Group as a visual cluster with a tie badge when Group.length > 1.
- Insertion behavior for Equal:
  - When user answers Equal against R[mid], insert new event into R[mid]'s group. If R is represented as flat array, convert to groups by splitting at that index into groups with single items except the tied group.
  - Persist a comparison record with result 'tie' and winnerId = null.
- Manual tie management:
  - Allow users to group or ungroup items via drag-and-drop plus a "Group as tie" action in the context menu.
  - Provide a small dialog to confirm creating a tie group or splitting an existing group.

Resolution flow for inconsistencies (brief)
- If cycle detected in comparisons graph (A > B, B > C, C > A), open a guided resolution modal:
  - Show the minimal conflicting set (e.g., the cycle) and ask targeted comparisons to break the cycle.
  - Offer an option to "Resolve automatically by score" (compute Elo/win-rate) to propose a consistent order, and let the user accept or re-evaluate.
- Always allow manual reorder as the ultimate override.

Extensibility: supporting multiple item types (concerts, movies, books, etc.)
 - Goal: make the app able to rank arbitrary "items" (concerts today, movies/books later) with minimal rewrites.

Data model changes
 - Introduce a generic Item record as the primary domain object instead of Event. Minimal finalized event model remains for concerts but will be a specialization.
   - Item: { id: string, type: string, createdAt: ISOString, data: Record<string, any> }
     - type: e.g., "concert", "movie", "book".
     - data: type-specific payload (for concerts: { artist, date, venue, notes }). Keep this free-form but validated by type adapters (see below).
 - Ranking becomes scoped by namespace: RankingKey = { type: string, year?: number, userScope?: string } and maps to an ordered array of item ids or groups.
 - Comparisons store must record item types or be able to resolve item ids to their types; comparison entries remain generic (aId, bId, winnerId|null, result, timestamp).

Type adapters and validation
 - Implement a small registry of TypeAdapters that declare:
   - typeId (string), humanLabel, schema (for validation), renderPreview(item.data) -> small preview used in comparison modal, formFields (for add modal), and optional import/export transforms.
 - On add-item, the app picks the adapter by type and uses adapter.formFields to render the input form and validate data before creating the Item record.
 - Adapters live in code under src/adapters/*.ts and are registered centrally. New adapters for movies/books can be added without touching core ranking logic.

UI implications
 - Global UI supports selecting active type and active year (e.g., "Concerts — 2026" or "Movies — 2025"). The ranked list view reads RankingKey to choose which ranking to show.
 - Comparison modal uses adapter.renderPreview to show a tailored preview of each item (artist/date/venue for concerts, title/director/year for movies, etc.). If no adapter exists for an item type, fall back to a simple JSON preview.
 - Add-item modal allows selecting type first (with quick presets: Concert, Movie, Book). Type-specific forms follow.
 - Settings include "Manage item types" for enabling/disabling adapters and importing adapter definitions (advanced).

Storage & migration
 - Items store: IndexedDB object store "items" storing Item objects with type and data payload.
 - Rankings and comparisons remain generic stores keyed by type/year.
 - Versioning: add a top-level store metadata.version and per-item schemaVersion if adapters evolve. Provide migration utilities that run on app startup when version mismatches are detected.

Comparison logic and algorithms
 - Core ranking algorithms (binary-insertion, tie handling, comparisons graph) operate on item ids and are agnostic to item type.
 - Where type matters (preview rendering, form validation), use adapter hooks only at the UI/persistence boundary.

Tests & developer workflow
 - Unit tests for adapters: validate formFields, validate sample payloads, and ensure renderPreview outputs expected short summary strings.
 - Integration tests: ensure adding an item via adapter ends up in items store, ranking updates correctly across types, and comparison modal uses adapter preview.
 - Document how to add a new TypeAdapter in docs/development/adding-adapter.md.

Backwards compatibility and migration path
 - Existing concert-only data can be migrated into new Item store by wrapping old Event objects into Item with type="concert" and data={artist,date,venue,notes}.
 - Provide an Import helper that recognizes the old export format and maps it to the new generic format automatically.
- Settings: Open/Save file, Export/Import JSON, Undo, Re-rank session, Reset year.

Edge cases & error handling
- Empty list add: become first.
- FS API unavailable: show clear fallback to Download/Upload JSON flows.
- Save failures: show a clear error and offer Export as fallback.
- Inconsistent comparisons: provide manual drag-and-drop and a guided re-rank flow.

Testing & verification
- Unit tests for binary-insertion algorithm and persistence layer (Vitest).
- Optional E2E test for add + rank (Playwright) - optional at MVP.
- TypeScript + linting (ESLint) enabled.

Deliverables
1. Project scaffold (SvelteKit + TypeScript) and initial pages/components for main screen, add modal, comparison modal, settings.
2. Persistence layer (IndexedDB) + import/export + FS API integration.
3. Binary-insertion algorithm implementation and unit tests.
4. Basic PWA manifest and service worker for offline behavior.

Next steps
1. Create an implementation plan (use writing-plans skill) after you review this spec.
2. On approval, scaffold the project and implement features incrementally with tests.

Approved-by: user
