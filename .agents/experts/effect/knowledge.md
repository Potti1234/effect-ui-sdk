# Effect UI expert: knowledge

What the Effect UI expert knows. Part 1 is Effect UI itself, part 2 is how `@ui-sdk/effect` is built, part 3 is the checklist a review walks. Pinned to what the repo installs: `@effect/ui` from the pkg.pr.new snapshot of commit `c73e7ce`, on `effect` 4.1. Effect UI isn't on npm yet, and its API moves between snapshots: when the pinned commit changes, check every export named here.

Last checked: 2026-11-26, against `node_modules/@effect/ui` at `c73e7ce`.

## 1. Effect UI, as its types and guide write it

- **A component** is `Html.component({ name, props, model, message, events }).make({ init, update, view })`. Props, Model, messages and events are Schemas. `update` returns the next Model or a step (`$.evolve(...)`, `.run(command)`, `.emit(event)`).
- **A headless component** finishes with `parts` instead of `view`. A consumer calls it with `h` and a `view` closure that applies each part to a builder of its own: `collapsible.trigger(h.button).children(...)`. `parts(p, model)` sees only `p.props`, `p.id(...)`, `p.part(...)` and the Model, never a service.
- **Events go up, props go down.** A parent hears a child through `onEmit`, a record with one handler per event or a function returning `undefined` for the ones it ignores. A parent can't send a child a message.
- **Handlers never see the DOM event.** `.on("click", Message)` or a function of a plain payload; `{ preventDefault: true }` cancels the default only when it returns a message. One capture-phase listener per event name on the mount container dispatches to the innermost element with a handler.
- **Mounts** are the element's lifecycle: `Mount.makeStream(name, { args }, (node, args, changes) => Stream)` runs once the element is committed, in a Scope that closes when the element goes, and its stream's values become messages. Mounts never run on the server or in `TestHost`.
- **The Model is encoded** for server state, history and the message log. A value with no real Schema needs `Schema.declare`, and one that can't travel encodes to something that can.
- **Ids** come from `p.id(name, key)`, derived from the instance's path, the same on the server and the client.
- **The host re-applies controlled properties** (`value`, `checked`, `selected`, `open`, `popoverOpen`) on every commit, so `.popover()` and `.open()` fight anything that shows or hides the element itself.
- **Attribute names** are ASCII-lowercased for HTML and kept as written for SVG. `h.el("svg")` and `h.el("path")` build SVG.

## 2. How `@ui-sdk/effect` is built

- `packages/effect/src/create-parts.ts` holds the one generic adapter, `createParts(primitive, { name, tags, present })`. Part files (`collapsible.ts`) call it and re-export core's types and controller factory, like every other framework's.
- **Options are props, callbacks are events.** Every option of kind `callback` becomes an event named without `on` (`onOpenChange` is `OpenChange`), carrying `{ value, reason, source }`. The other options become optional props, typed from the primitive's options.
- **The core instance lives in a handle in the Model.** The Model is `{ handle, version }`. The handle encodes to `null` and decodes to a fresh handle, so server state and history carry no instance. `parts` makes the instance on its first render with `unwatched()`, and hands it changed options with `setOptions`.
- **A Subscription owns the instance's life.** `KeepInstance` runs for as long as the component lives: it calls `keep(instance)`, subscribes to the store and relays callbacks as messages, and its scope closing releases and destroys the instance. So a primitive without a root element, like Popover, keeps its instance, and a kept-alive component keeps its state. Every part, the root included, binds through the `BindPart` mount.
- **Core binds every handler itself.** Parts bind with `{ by: "framework", attaches: [] }`, so core attaches its own DOM listeners on the element, and writes `live` and `direct` attributes itself. Effect UI's delegated capture listener runs first, so a consumer's `{ preventDefault: true }` handler skips core's, which is the "user handlers run first" contract.
- **Renders follow `renderVersion`.** The store's listener sends `ChangedState({ version })` only when the render version changes, so live state like a highlight never renders the Effect UI component again.
- **Attributes merge in `forward`.** A part reads the consumer's finished attributes, takes the author's id with `takeOwnId`, gives way to the author's names (`yieldToAuthor`), combines classes and styles, and writes its own after.
- **Presence**: slots listed in `present` return `undefined` while `present()` says the element shouldn't exist. `createParts` throws when the list disagrees with the primitive's slots, so the types and the runtime can't drift.
- **Ids** start with `ui-sdk-`, followed by Effect UI's path id. An `id`-kind slot prop left out is made from the slot and the part's place among the parts of its slot that rendered, so the server and the client agree.
- **Parts inside parts**: `parts.in(slot, props)` gives the parts inside one part, filling the props their schema takes `from` it, like an accordion trigger's item `value`. A keyed slot hands its key as `value`.
- **Part state**: `parts.state` is the root's, and every part has `state(props)`.
- **Api calls**: `parts.calls.<method>(builder, ...args)` is a part that sends `PressedCall`, and `update` runs the `CallApi` Command.
- **`attach(run, deps)`** in `@ui-sdk/effect/primitive` is a mount that runs an element behavior (`bindHold`, `bindScrollPicker`) while the element is in the page, with `send` for messages.
- **Utilities**: `preference(p, toMessage)` and `shortcut(keys, message)` are Subscriptions; `setPreference` is a Command; `Preferences(h, ...)` is a view function that renders the pre-hydration script.

## 3. Review checklist

- A new part file lists exactly the slots with `present` in `present`, and exports the same names and types as the other frameworks.
- Fixtures are controlled where the other frameworks cancel with `details.cancel()`: the Model refuses the change.
- Imperative calls (a controller's methods) happen in Commands, never in `view` or `update`.
- Nothing renders `.popover()` or `.open()` on an element core shows or hides.
- Examples have no comments and follow `contributing/examples.md`.
