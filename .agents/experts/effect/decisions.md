# Effect UI expert: decisions

What's already decided about `@ui-sdk/effect`, and what's known and open. The expert never re-raises a **Settled** item as a finding.

Last reviewed: the Effect UI adapter branch (2026-11-26, the adapter and Collapsible).

## Settled

- **Core binds handlers, not Effect UI.** Effect UI's handlers get a plain payload and only the innermost element hears an event, so core attaches its own listeners in `bind` (`attaches: []`). Effect UI's delegated listener is in the capture phase on the container, so the consumer's handlers still run first.
- **Callbacks are events named after the option** (`onOpenChange` is `OpenChange`) with `{ value, reason, source }`, the same shape as the web components' `detail`. Effect UI's own naming guide would name a request `RequestedOpen`; one rule for every option keeps the shape the same across ui-sdk's frameworks, and the consumer names its own message (`RequestedOpenChangeDetails`).
- **No `details.cancel()`.** An event reaches `update` after core has decided, so cancelling is controlling the value and leaving the Model as it is. Fixtures that cancel are controlled.
- **The instance is in the Model as a handle that encodes to `null`.** A module-level registry keyed by path would share an instance between two server requests rendering the same path; the Model is per instance. Time travel and history restore don't restore core's state, and `restore: false` says so.
- **A Subscription owns the instance, not a mount.** Subscriptions run for the component's whole life, through keep-alive too, and need no root element. The instance is destroyed when the component ends.
- **Parts that leave the page are listed in `present`.** Core's slot types don't say which slots have `present`, so the part file lists them, and `createParts` throws when the list is wrong.
- **Controllers are called from Commands**, so a Story sees the call by name.
- **Nested parts are explicit**: `in(slot, props)`, since a view closure has no context to carry an item's props down.
- **The api is reached through parts** (`calls`), as Effect UI's guide says a control that starts a child's own work is one of its parts.
- **Element behaviors go through `attach`**, one generic mount, rather than a wrapper per behavior.

## Known and open

- **Events with values that need a Schema of their own**, like a Date Picker's date, travel as `Schema.Unknown`. Typed event Schemas per component would let the message log decode them.
- **`action` options** (a Button's `onAction` returning a Promise) have no Effect UI shape yet.
- **Ids are long**: Effect UI's path id escapes every character outside `[A-Za-z0-9]`.
- **A headless child's `view` that returns an array renders nothing** at `c73e7ce`, with no ui-sdk involved, though its type allows one. Return one element. To report to Effect UI.
- **Async options** may be Effect UI's `Query` rather than a port of `useAsyncOptions`: to decide with Combobox.
- **`OverlayHost`** (`confirm()`, `toast()`) waits for the Dialog and Toast components.
- **Group contexts** (a Checkbox joining a CheckboxGroup) need Effect UI's `shares` and `reads`: decided with those components.
