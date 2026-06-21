Title: Inline Edit — Design
Date: 2026-06-21
Author: OpenCode

Overview
- Replace the existing modal-based edit flow with an inline edit experience: clicking an item card opens an inline edit box that replaces the card contents.
- Editing preserves item id and ranking order; only the item.data fields (artist, date, venue) are editable.
- Fast-entry input is NOT shown in edit mode.
- Behavior chosen: Autofocus first input (Artist) when editing begins; pressing Escape cancels the edit and returns keyboard focus to the original item card.

Goals
- Make editing fast and discoverable: click anywhere on a card to edit.
- Avoid accidental cancelations: clicking inside the edit fields must interact with inputs and must not cancel the edit.
- Keyboard accessibility: card must be focusable; Enter/Space open editor; Escape cancels and returns focus.
- Minimal API changes: reuse AddItemModal component in edit mode; add a small update API in itemsStore and wire existing UI to it.

Constraints
- Do not change item IDs or ranking logic during edits.
- Keep changes minimal and local: prefer reusing AddItemModal rather than creating a new editor component.
- Test-only helpers remain gated behind VITE_E2E.
- Work in existing code patterns (Svelte + idb + stores).

User-facing behavior (acceptance criteria)
1. Clicking (or pressing Enter/Space) on a card opens inline edit, the Artist input receives focus.
2. While editing:
   - Artist line and Edit button are hidden.
   - The inline edit box replaces the meta area and contains Artist / Date / Venue inputs and Save / Cancel actions.
   - Clicking inside inputs does not cancel edit.
   - Pressing Escape cancels edit and returns focus to the card root (or the Edit button if present).
3. Saving updates the item in memory and persistence (IndexedDB) and updates UI immediately; ranking order is unchanged.
4. Clicking the card while already editing does not cancel; clicking the Edit button toggles edit (second click cancels).
5. All interactive elements are keyboard-accessible and have visible focus styles.

Accessibility
- Card root has tabindex="0" so it is keyboard focusable.
- When editing begins, focus is moved programmatically to the Artist input; Save and Cancel remain reachable by keyboard tabbing.
- Escape key cancels and returns focus to the card (visual focus ring retained).
- Inline edit region should not trap assistive technologies: use aria-live or role changes only if later needed.

Data flow and events
- ItemCard dispatches 'edit' to request editing the item (parent sets editingId).
- RankedList forwards edit events to route; route sets editingItem (id + data).
- ItemCard receives editing prop (id === editingId) and, when editing === true, renders AddItemModal inline with:
  - initial={item.data}
  - mode='edit'
  - inline={true}
  - on:update => propagate id + data up to route (which calls itemsStore.updateItem)
  - on:cancel => propagate cancel to route (route clears editingId and returns focus)
- itemsStore.updateItem(id, nextData) merges and persists.

Files changed
- src/lib/components/AddItemModal.svelte — autofocus & Escape handling for inline edit; artist input ref; click/key propagation fixes
- src/lib/components/ItemCard.svelte — data-item-id attribute; inline rendering; click-to-edit and keyboard handling
- src/lib/components/RankedList.svelte — forwards edit/update/cancel-edit events and accepts editingId
- src/routes/+page.svelte — manage editingId, focus restoration after save/cancel, update flow
- src/lib/stores/itemsStore.ts — updateItem implementation (merge & persist)
- tests: unit + e2e added for updateItem & inline-edit behavior

Testing
- Unit: itemsStore.updateItem ensures in-memory and persisted values update.
- E2E: playwright/inline-edit.spec.ts verifies open, focus, inputs interaction, Escape cancel, Save persists.

Implementation notes
- Use await tick() before focusing elements.
- StopPropagation on clicks inside inline modal to avoid bubbling to card handlers.
- Keep editor UI minimal and consistent with Add modal.

Estimate
- Implementation: 60–120 minutes.
- Tests: 30–60 minutes.
