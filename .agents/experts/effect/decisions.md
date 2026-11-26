# Effect UI expert: decisions

What's already decided about `@ui-sdk/effect`, and what's known and open. The expert never re-raises a **Settled** item as a finding.

Last reviewed: the Effect UI adapter branch (2026-11-26, the adapter and 19 components).

## Settled

- **Core binds handlers, not Effect UI.** Effect UI's handlers get a plain payload and only the innermost element hears an event, so core attaches its own listeners in `bind` (`attaches: []`). Effect UI's delegated listener is in the capture phase on the container, so the consumer's handlers still run first.
- **Callbacks are events named after the option** (`onOpenChange` is `OpenChange`) with `{ value, reason, source }`, the same shape as the web components' `detail`. Effect UI's own naming guide would name a request `RequestedOpen`; one rule for every option keeps the shape the same across ui-sdk's frameworks, and the consumer names its own message (`RequestedOpenChangeDetails`).
- **Events first, callbacks when it can't wait.** An event reaches `update` after core has decided, so refusing a change is controlling the value and leaving the Model as it is. A callback option passed as a prop still runs synchronously before its event, for `details.cancel()` and a spec that reads a log at once. A callback that takes only details, like `onDismissAttempt`, sends its event with no value.
- **Messages go out through a part's own handler, not only the Subscription.** A Subscription's message reaches `update` a task later, after a spec or a screen reader has read the page and a frame has painted. A change made in a DOM event dispatches a `ui-sdk-message` event on a bound part element, whose handler hands the message over inside that event; a change made anywhere else does the same a microtask later. The Subscription queue is the fallback when no part element is bound, and on the server.
- **Action options are events too.** An option of kind `action`, like a Button's `action` or a Command item's `onSelect`, is an event named after it (`Action`, `Select`), without the DOM event, sent for each press core accepts. A prop passed as before still runs first, and its returned Promise keeps the part pending.
- **A disabled part drops the consumer's click.** Effect UI's capture listener runs before core can refuse a press, so a part whose attributes say `aria-disabled="true"` replaces the consumer's `click` handler with one that does nothing.
- **A part that leaves the page hides at once.** When a bound part's presence turns false, its element gets `display: none` until the render removes it, so no frame shows it, like an avatar's fallback once a cached image binds.
- **A part inside `in(slot)` takes the ids `in` made** for its own slot, so an item and the parts inside it agree without a `value`.
- **Parts keep their nodes by keys of their own.** Effect UI matches unkeyed siblings by position, so a part that comes and goes would rebuild the parts after it. Each part element takes `ui-sdk:<slot>:<key>:<n>` unless the author keys it. The author's own unkeyed elements after a part that leaves still rebuild, so a fixture keys them.
- **What focus reads is written at once.** On a focus event, the focused element and every part around it write their attributes, and so does a change to an element focused in the same listener. Everything else waits for the render, so a spec reading an output after an attribute sees both together.
- **A render follows what it read.** A store change renders again when renderVersion moves, or when any part's attributes, state or presence the last render read would change.
- **The instance is in the Model as a handle that encodes to `null`.** A module-level registry keyed by path would share an instance between two server requests rendering the same path; the Model is per instance. Time travel and history restore don't restore core's state, and `restore: false` says so.
- **A Subscription owns the instance, not a mount.** Subscriptions run for the component's whole life, through keep-alive too, and need no root element. The instance is destroyed when the component ends.
- **Parts that leave the page are listed in `present`.** Core's slot types don't say which slots have `present`, so the part file lists them, and `createParts` throws when the list is wrong.
- **Controllers are called from Commands**, so a Story sees the call by name.
- **Nested parts are explicit**: `in(slot, props)`, since a view closure has no context to carry an item's props down.
- **The api is reached through parts** (`calls`), as Effect UI's guide says a control that starts a child's own work is one of its parts.
- **Element behaviors go through `attach`**, one generic mount, rather than a wrapper per behavior.

## Known and open

- **Events with values that need a Schema of their own**, like a Date Picker's date, travel as `Schema.Unknown`. Typed event Schemas per component would let the message log decode them.
- **Mounts bind across tasks.** Effect UI's scheduler runs each mount in its own fiber with a 5ms budget, so parts of one render bind over several tasks. Core code that assumes they bind together breaks; Segmented Control's indicator now measures again when items join. Look for the same assumption when a spec fails only on `effect`.
- **Server render order isn't page order.** Effect UI renders a child component after its parent's view, so on the server a parent's own toolbar item claims the tab stop before a toggle that comes first on the page. Hydration corrects it; `toolbar.ssr` fails on `effect-ssr`.
- **`toolbarScope(toolbar.join, disabled?)`** is an Effect-only export, since core's `toolbar` option wants a roving scope, not the api `join` returns. To decide whether it stays.
- **Ids are long**: Effect UI's path id escapes every character outside `[A-Za-z0-9]`.
- **A view that returns an array renders nothing**, with no error, though the types reject it: [Effect-TS/ui#301](https://github.com/Effect-TS/ui/issues/301), with a patch that fails such a view instead. Return one element.
- **Async options** may be Effect UI's `Query` rather than a port of `useAsyncOptions`: to decide with Combobox.
- **`OverlayHost`** (`confirm()`, `toast()`) waits for the Dialog and Toast components.
- **Group contexts** (a Checkbox joining a CheckboxGroup) need Effect UI's `shares` and `reads`: decided with those components.
