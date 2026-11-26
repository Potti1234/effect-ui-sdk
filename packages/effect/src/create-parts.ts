import type {
  OptionsOf,
  Part,
  Primitive,
  PrimitiveInstance,
  PropsOf,
  SlotName,
  StateOf,
  TypesOf,
} from "@ui-sdk/core"
import {
  attrs as partAttrs,
  bind,
  keep,
  partState,
  present as isPresent,
  release,
  renderVersion,
  sameSlotState,
  schemaOf,
  subscribe,
  takeOwnId,
  unwatched,
  yieldToAuthor,
} from "@ui-sdk/core/renderer"
import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as Html from "@effect/ui/html/Html"
import * as Mount from "@effect/ui/Mount"
import * as Subscription from "@effect/ui/Subscription"
import * as UiSchema from "@effect/ui/UiSchema"
import * as View from "@effect/ui/View"
import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Schema from "effect/Schema"
import * as SchemaTransformation from "effect/SchemaTransformation"
import * as Stream from "effect/Stream"

type Attrs = Record<string, string | undefined>

type Details = { reason?: string; source?: string }

type Call = {
  readonly name: string
  readonly value: unknown
  readonly reason?: string
  readonly source?: string
  readonly key?: string
}

// What one instance of a component holds outside its Model: the core
// instance, the options its last render passed, and the parts it rendered.
class Handle {
  instance: PrimitiveInstance | undefined
  options: Record<string, unknown> | undefined
  callbacks:
    Record<string, (value: unknown, details?: Details) => void> | undefined
  slotCallbacks: Record<string, (...args: unknown[]) => void> = {}
  // The callbacks the consumer passed, read when core calls them.
  given: Record<string, unknown> | undefined
  slotGiven: Record<string, unknown> = {}
  parts = new Map<string, Part>()
  // Each part's attributes as the last render wrote them, and the author's.
  rendered = new Map<
    string,
    { attrs: Attrs; author: Readonly<Record<string, string>> }
  >()
  // The api for a member to join, like a checkbox its group's, the same
  // function on every render.
  join: (() => unknown) | undefined
  // What the last render read of the instance, read again on every change.
  reads: { value: unknown; again: () => unknown }[] = []
  emit: ((call: Call) => void) | undefined
  // The bound part elements, and the messages waiting for one to deliver them.
  nodes = new Set<HTMLElement>()
  pending: PrimitiveMessage[] = []
}

const isHandle = (value: unknown): value is Handle => value instanceof Handle

// The Model encodes the handle as null, so server state, history and the
// message log carry no instance, and decoding starts a fresh one.
const HandleModel = Schema.Null.pipe(
  Schema.decodeTo(
    Schema.declare(isHandle),
    SchemaTransformation.transform({
      decode: () => new Handle(),
      encode: () => null,
    })
  )
)

const HandleArg = Schema.declare(isHandle)

const PrimitiveModel = Schema.Struct({
  handle: HandleModel,
  version: Schema.Number,
})

const PrimitiveMessage = UiSchema.TaggedEnum({
  ChangedState: { version: Schema.Number },
  CalledCallback: {
    name: Schema.String,
    value: Schema.Unknown,
    reason: Schema.optional(Schema.String),
    source: Schema.optional(Schema.String),
    key: Schema.optional(Schema.String),
  },
  PressedCall: { method: Schema.String, args: Schema.Array(Schema.Unknown) },
})

// Runs an api method a consumer's control asked for, like a rating's
// `rate(3)` from a button outside it, as a Command, so the log names it.
const CallApi = Command.make(
  "CallApi",
  {
    args: {
      handle: Schema.declare(isHandle),
      method: Schema.String,
      args: Schema.Array(Schema.Unknown),
    },
  },
  ({ handle, method, args }) =>
    Effect.sync(() => {
      const api = handle.instance?.api as
        Record<string, (...args: unknown[]) => unknown> | undefined
      api?.[method]?.(...args)
      return Component.noop
    })
)

type PrimitiveMessage = typeof PrimitiveMessage.Type

const propSchemas: Record<string, Schema.Top> = {
  boolean: Schema.Boolean,
  number: Schema.Number,
  string: Schema.String,
  id: Schema.String,
  key: Schema.String,
  list: Schema.Array(Schema.Unknown),
}

const kindOf = (spec: unknown) =>
  typeof spec === "string" ? spec : (spec as { kind: string }).kind

const isAction = (spec: unknown) => kindOf(spec) === "action"

const isCallback = (spec: unknown) =>
  kindOf(spec) === "callback" || isAction(spec)

// Where a prop comes from when its part leaves it out: the slot around it,
// and that slot's prop, which `"group.id"` names and `"item"` leaves to
// the prop's own name.
function fromOf(spec: unknown, key: string) {
  if (typeof spec !== "object" || spec === null || !("from" in spec)) {
    return undefined
  }
  const [slot, prop = key] = String(spec.from).split(".")
  return { slot, prop }
}

const required = (spec: unknown) =>
  typeof spec === "object" && spec !== null && "required" in spec
    ? Boolean(spec.required)
    : false

// The props of the parts around the ones rendering, by slot.
type Around = Record<string, Record<string, unknown>>

// `onOpenChange` is `OpenChange`, and an action without `on`, like a
// button's `action`, is `Action`.
const eventName = (option: string) =>
  /^on[A-Z]/.test(option)
    ? option.slice(2)
    : option.replace(/^./, (first) => first.toUpperCase())

const camel = (slot: string) =>
  slot.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())

const host = { by: "framework", attaches: [] } as const

// Binds a part's element once it's in the page, and binds again when the
// render hands the element another part, like a key that changed.
const BindPart = Mount.makeStream(
  "BindPart",
  { args: { handle: HandleArg, part: Schema.String } },
  (node: HTMLElement, args, changes) =>
    Stream.callback<never>(
      Effect.fnUntraced(function* () {
        let unbind = () => {}
        let bound: Part | undefined
        let current = args
        const follow = (next: typeof args) => {
          current = next
          const part = next.handle.parts.get(next.part)
          if (part === bound) {
            return
          }
          unbind()
          bound = part
          if (!part) {
            unbind = () => {}
            return
          }
          const unbindPart = bind(part, node, host)
          next.handle.nodes.add(node)
          listenForFocus(node)
          const write = () => writeChanged(next.handle, next.part, part, node)
          writers.set(node, write)
          const unsubscribe = subscribe(part, () => {
            if (justFocused === node) {
              write()
            }
            hideWhileAbsent(part, node)
          })
          hideWhileAbsent(part, node)
          unbind = () => {
            unsubscribe()
            next.handle.nodes.delete(node)
            if (writers.get(node) === write) {
              writers.delete(node)
            }
            unbindPart()
          }
        }
        follow(args)
        yield* Effect.addFinalizer(() =>
          Effect.sync(() => {
            unbind()
            if (current.handle.parts.get(current.part) === bound) {
              current.handle.parts.delete(current.part)
            }
          })
        )
        yield* Stream.runForEach(changes, (next) =>
          Effect.sync(() => follow(next))
        ).pipe(Effect.forkScoped)
      })
    )
)

// Effect UI renders a change a task after the event that made it. As focus
// moves, the parts a screen reader reads then write their attributes right
// away: the focused element and the parts around it, like a popup naming
// itself after its title as focus enters it, and a change to the element
// that took focus in the same listener, like a radio an arrow key moved to
// and checked. Classes and styles, which merge with the author's, wait for
// the render.
const writers = new WeakMap<Element, () => void>()
let justFocused: EventTarget | null = null
let listening = false

function listenForFocus(el: HTMLElement) {
  if (listening) {
    return
  }
  listening = true
  el.ownerDocument.defaultView?.addEventListener(
    "focus",
    (event) => {
      justFocused = event.target
      queueMicrotask(() => (justFocused = null))
      for (
        let node = event.target instanceof Element ? event.target : null;
        node;
        node = node.parentElement
      ) {
        writers.get(node)?.()
      }
    },
    true
  )
}

// A part that leaves the page, like an avatar's fallback once a cached image
// binds, is hidden at once, so no frame shows it before the render removes it.
const hidden = new WeakMap<HTMLElement, string>()

function hideWhileAbsent(part: Part, el: HTMLElement) {
  const absent = !isPresent(part)
  if (absent && !hidden.has(el)) {
    hidden.set(el, el.style.display)
    el.style.display = "none"
  } else if (!absent && hidden.has(el)) {
    el.style.display = hidden.get(el)!
    hidden.delete(el)
  }
}

function writeChanged(
  handle: Handle,
  key: string,
  part: Part,
  el: HTMLElement
) {
  const rendered = handle.rendered.get(key)
  if (!rendered) {
    return
  }
  const next = merge(partAttrs(part), rendered.author)
  for (const name in rendered.attrs) {
    if (!(name in next) && name !== "class" && name !== "style") {
      el.removeAttribute(name)
    }
  }
  for (const [name, value] of Object.entries(next)) {
    if (
      name !== "class" &&
      name !== "style" &&
      el.getAttribute(name) !== value
    ) {
      el.setAttribute(name, value!)
    }
  }
  rendered.attrs = next
}

// A Subscription's message reaches `update` a task later, after a spec or a
// screen reader has read the page and a frame has painted. A message goes out
// through a part element's own handler instead: inside the DOM event that
// made the change, or a microtask after a change made anywhere else.
const deliverEvent = "ui-sdk-message"

function deliver(handle: Handle, message: PrimitiveMessage) {
  for (const node of handle.nodes) {
    if (!node.isConnected) {
      continue
    }
    handle.pending.push(message)
    node.dispatchEvent(new CustomEvent(deliverEvent))
    const left = handle.pending.indexOf(message)
    if (left === -1) {
      return true
    }
    handle.pending.splice(left, 1)
    return false
  }
  return false
}

// Keeps the instance for as long as the component lives, reports every
// change that affects rendering, and relays the instance's callbacks. A
// Subscription, so a primitive without a root element, like a popover's,
// keeps its instance too, and a kept-alive component keeps its state.
const keepInstance = (handle: Handle) =>
  Stream.callback<PrimitiveMessage>(
    Effect.fnUntraced(function* (queue) {
      const instance = handle.instance
      if (!instance) {
        return
      }
      let version = renderVersion(instance)
      let renders = 0
      // State that affects rendering renders again, and so does live state,
      // like an item's index, but only when the last render read it.
      const changed = () => {
        const next = renderVersion(instance)
        const read = handle.reads.some(
          ({ value, again }) => !sameSlotState(value, again())
        )
        if (next !== version || read) {
          version = next
          send(PrimitiveMessage.ChangedState({ version: ++renders }))
        }
      }
      const send = (message: PrimitiveMessage) => {
        const later = () => {
          if (!deliver(handle, message)) {
            Queue.offerUnsafe(queue, message)
          }
        }
        if (!globalThis.window) {
          Queue.offerUnsafe(queue, message)
        } else if (window.event) {
          later()
        } else {
          queueMicrotask(later)
        }
      }
      handle.emit = (call) => send(PrimitiveMessage.CalledCallback(call))
      keep(instance)
      const unsubscribe = instance.subscribe(changed)
      changed()
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          unsubscribe()
          handle.emit = undefined
          release(instance)
          instance.destroy()
          handle.instance = undefined
          handle.parts.clear()
        })
      )
    })
  )

// Callbacks the instance calls, which the root relays as messages once it's
// in the page. Their details become plain data: what changed, why and how.
function callbacksOf(handle: Handle, names: string[], actions: string[]) {
  return (handle.callbacks ??= Object.fromEntries(
    names.map((name) => [
      name,
      first(
        () => handle.given?.[name],
        relay(handle, eventName(name), undefined, actions.includes(name))
      ),
    ])
  ))
}

// A callback the consumer passes runs first, synchronously, for what can't
// wait for a message, like `details.cancel()`, and an action's Promise keeps
// its part pending. Then the event goes out.
const first =
  (own: () => unknown, then: (...args: any[]) => void) =>
  (...args: unknown[]) => {
    const callback = own()
    const result =
      typeof callback === "function" ? callback(...args) : undefined
    then(...args)
    return result
  }

const isFunction = (value: unknown): value is (...args: any[]) => unknown =>
  typeof value === "function"

// A callback that relays its call as the event `tag`, with the key of the
// part it belongs to, like an accordion item's.
const relay =
  (handle: Handle, tag: string, key?: string, action = false) =>
  (...args: unknown[]) => {
    // An action, like a button's, gets the DOM event first, which a message
    // can't carry.
    const given = action ? args.filter((arg) => !isEvent(arg)) : args
    if (action && given.length > 1 && given[0] === undefined) {
      given.shift()
    }
    const [first, second] = given as [unknown, Details | undefined]
    // A callback that takes only the details, like `onDismissAttempt`, has no value.
    const alone =
      second === undefined && (isDetails(first) || (action && isSourced(first)))
    const value = alone ? undefined : first
    const details = alone ? first : second
    handle.emit?.({
      name: tag,
      value,
      ...(details?.reason === undefined ? {} : { reason: details.reason }),
      ...(details?.source === undefined ? {} : { source: details.source }),
      ...(key === undefined ? {} : { key }),
    })
  }

const isDetails = (value: unknown): value is Details =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { reason?: unknown }).reason === "string"

const isSourced = (value: unknown): value is Details =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { source?: unknown }).source === "string"

const isEvent = (value: unknown) =>
  typeof Event !== "undefined" && value instanceof Event

// The event a slot's callback prop is, like an item's `onOpenChange`: `ItemOpenChange`.
const slotEventName = (slot: string, prop: string) =>
  camel(slot).replace(/^./, (first) => first.toUpperCase()) + eventName(prop)

function sameOptions(
  a: Record<string, unknown> | undefined,
  b: Record<string, unknown>
) {
  if (!a) {
    return false
  }
  const keys = Object.keys(b)
  return (
    keys.length === Object.keys(a).length &&
    keys.every((key) => Object.is(a[key], b[key]))
  )
}

const asciiSpace = /[ \t\n\f\r]+/

function joinTokens(author: string | undefined, own: string | undefined) {
  if (!own) {
    return author
  }
  if (!author) {
    return own
  }
  const tokens = author.split(asciiSpace)
  return own
    .split(asciiSpace)
    .reduce(
      (all, token) =>
        token && !tokens.includes(token) ? `${all} ${token}` : all,
      author
    )
}

// The part's attributes over the author's: the author's id and names win,
// classes combine, and styles combine with the part's properties winning.
function merge(own: Attrs, author: Readonly<Record<string, string>>) {
  const result: Attrs = {
    ...yieldToAuthor(own, (name) => author[name] !== undefined),
  }
  if (author.id) {
    delete result.id
  }
  if (result.class !== undefined) {
    result.class = joinTokens(author.class, result.class)
  }
  if (result.style !== undefined && author.style) {
    result.style = `${author.style.replace(/;\s*$/, "")};${result.style}`
  }
  // A value the part leaves out is the author's, or no one's: writing it as
  // undefined would remove the author's own.
  for (const name in result) {
    if (result[name] === undefined) {
      delete result[name]
    }
  }
  return result
}

/**
 * Makes an Effect UI headless component from a primitive. Its props are the
 * primitive's options, its events are the options' callbacks, and its parts
 * are the slots named in `tags`, each a decorator for the consumer's own
 * builder. List the slots that decide whether their element is in the page
 * in `present`: their parts return `undefined` while it shouldn't be.
 * @experimental
 */
function createParts<
  P extends Primitive,
  const Tags extends Partial<Record<SlotName<P>, string>>,
  const Present extends keyof Tags & string = never,
  const Names extends Partial<Record<keyof Tags & string, string>> = {},
  const StateSlot extends SlotName<P> = "root" & SlotName<P>,
>(
  primitive: P,
  options: {
    name: string
    tags: Tags
    present?: readonly Present[]
    names?: Names
    state?: StateSlot
    /**
     * What a part shows when its element has no children of its own, from
     * the part's state, like a field error's message.
     */
    content?: Partial<Record<keyof Tags & string, (state: any) => unknown>>
  }
) {
  const schema = schemaOf(primitive) as {
    options: Record<string, unknown>
    slots: Record<string, Record<string, unknown>>
  }
  const slotSchemas = schema.slots
  const keyProps = Object.fromEntries(
    Object.entries(slotSchemas).flatMap(([slot, specs]) => {
      const key = Object.keys(specs).find(
        (name) => kindOf(specs[name]) === "key"
      )
      return key ? [[slot, key]] : []
    })
  )
  const optionNames = Object.keys(schema.options).filter(
    (name) => name !== "debug"
  )
  const callbacks = optionNames.filter((name) =>
    isCallback(schema.options[name])
  )
  const actions = optionNames.filter((name) => isAction(schema.options[name]))
  const fields: Schema.Struct.Fields = Object.fromEntries([
    ["id", Schema.optional(Schema.String)],
    ...optionNames.map((name) => [
      name,
      Schema.optional(
        isCallback(schema.options[name])
          ? Schema.declare(isFunction)
          : (propSchemas[kindOf(schema.options[name])] ?? Schema.Unknown)
      ),
    ]),
  ])
  const props = Schema.Struct(fields) as unknown as Schema.Codec<
    Record<string, unknown>
  >
  const slots = Object.keys(options.tags)
  const names = (options.names ?? {}) as Record<string, string | undefined>
  const nameOf = (slot: string) => names[slot] ?? camel(slot)
  const slotOf = (name: string) =>
    Object.keys(names).find((slot) => names[slot] === name) ??
    slots.find((slot) => camel(slot) === name) ??
    name
  const stateSlot: string = options.state ?? "root"
  const slotCallbacks = Object.fromEntries(
    slots.map((slot) => [
      slot,
      Object.keys(slotSchemas[slot] ?? {}).filter((prop) =>
        isCallback(slotSchemas[slot][prop])
      ),
    ])
  )
  const payload = {
    value: Schema.Unknown,
    reason: Schema.optional(Schema.String),
    source: Schema.optional(Schema.String),
  }
  const events = UiSchema.TaggedEnum(
    Object.fromEntries([
      ...callbacks.map((name) => [eventName(name), payload]),
      ...slots.flatMap((slot) =>
        slotCallbacks[slot].map((prop) => [
          slotEventName(slot, prop),
          { ...payload, key: Schema.optional(Schema.String) },
        ])
      ),
    ])
  ) as any
  const definitions = (
    primitive as unknown as { slots: Record<string, object> }
  ).slots
  const present: readonly string[] = options.present ?? []
  for (const slot of slots) {
    if ("present" in definitions[slot] !== present.includes(slot)) {
      throw new Error(
        `${options.name}: list "${slot}" in \`present\` exactly when its slot decides whether it's in the page.`
      )
    }
  }

  function instanceOf(
    handle: Handle,
    given: Record<string, unknown>,
    id: string
  ) {
    handle.given = given
    const next: Record<string, unknown> = {
      ...given,
      ...callbacksOf(handle, callbacks, actions),
      id: given.id ?? id,
    }
    if (!handle.instance) {
      handle.options = next
      handle.instance = unwatched(() =>
        primitive(next as never)
      ) as unknown as PrimitiveInstance
    } else if (!sameOptions(handle.options, next)) {
      handle.options = next
      handle.instance.setOptions(next)
    }
    return handle.instance
  }

  const component = Html.component({
    name: options.name,
    props,
    model: PrimitiveModel,
    message: PrimitiveMessage,
    events,
    restore: false,
  }).make({
    init: () => ({ handle: new Handle(), version: 0 }),
    subscriptions: ({ model }: { model: typeof PrimitiveModel.Type }) => [
      Subscription.make(
        "KeepInstance",
        Stream.suspend(() => keepInstance(model.handle))
      ),
    ],
    update: {
      ChangedState: ($: any, { version }: { version: number }) =>
        $.evolve({ version }),
      CalledCallback: ($: any, { name, ...payload }: Call) =>
        $.emit(events[name](payload)),
      PressedCall: (
        $: any,
        { method, args }: { method: string; args: readonly unknown[] }
      ) => $.run(CallApi.make({ handle: $.model.handle, method, args })),
    },
    parts: (p: any, model: typeof PrimitiveModel.Type) => {
      const { handle } = model
      const instance = instanceOf(handle, p.props, `ui-sdk-${p.id("ui")}`)
      const decorated: Record<string, any> = {}
      for (const slot of slots) {
        decorated[slot] = p.part(
          (builder: any, slotProps: Record<string, unknown>) => {
            const part = instance.part(slot, slotProps)
            const mapKey = `${slot}:${part.key}`
            handle.parts.set(mapKey, part)
            return builder
              .on(deliverEvent, () => handle.pending.shift())
              .onMount(BindPart({ handle, part: mapKey }))
              .forward((node: any) => {
                const author = node.elementAttrs as Record<string, string>
                takeOwnId(part, author.id)
                const fill = options.content?.[slot as keyof Tags & string]
                const filled =
                  fill && !node.content?.length
                    ? node.children(fill(track(() => partState(part))))
                    : node
                const attrs = track(() =>
                  merge(partAttrs(part, slotProps), author)
                )
                handle.rendered.set(mapKey, { attrs, author })
                // Effect UI's listener runs before core's, which would refuse
                // the press, so a disabled part drops the consumer's click.
                const refused =
                  attrs["aria-disabled"] === "true" &&
                  node.handlers?.click !== undefined
                return (
                  refused
                    ? filled.on("click", () => undefined, {
                        preventDefault: "always",
                      })
                    : filled
                ).attrs(attrs)
              })
          }
        )
      }
      // How often each slot rendered without its own id, for ids made the
      // same on the server and the client.
      const counts: Record<string, number> = {}
      // How often each part rendered, so parts without keys of their own,
      // like two close buttons, take different element keys.
      const occurrences: Record<string, number> = {}
      const resolve = (
        slot: string,
        given: Record<string, unknown> = {},
        around: Around,
        rendering = true
      ) => {
        const specs = slotSchemas[slot] ?? {}
        const resolved = { ...given }
        for (const key in specs) {
          if (resolved[key] !== undefined) {
            continue
          }
          const spec = specs[key]
          if (kindOf(spec) === "id") {
            // Inside `in(slot)`, the slot's own part is the one `in` made the id for.
            const enclosing = around[slot]?.[key]
            if (enclosing !== undefined) {
              resolved[key] = enclosing
              continue
            }
            const index = (counts[`${slot}.${key}`] ??= 0)
            if (rendering) {
              counts[`${slot}.${key}`]++
            }
            resolved[key] = `ui-sdk-${p.id(`${slot}-${key}`, index)}`
            continue
          }
          const from = fromOf(spec, key)
          if (from && !(from.slot in definitions)) {
            const index = (counts[`${slot}.${key}`] ??= 0)
            if (rendering) {
              counts[`${slot}.${key}`]++
            }
            resolved[key] = `${slot}-${index}`
            continue
          }
          const value = from ? around[from.slot]?.[from.prop] : undefined
          if (value !== undefined) {
            resolved[key] = value
          } else if (from && required(spec)) {
            throw new Error(
              `${options.name}: apply ${camel(slot)} inside ${camel(from.slot)}, with ${camel(options.name)}.in("${from.slot}", props).`
            )
          }
        }
        const key = String(resolved.id ?? resolved.value ?? "")
        for (const prop of slotCallbacks[slot]) {
          const tag = slotEventName(slot, prop)
          const id = `${tag}:${key}`
          if (rendering) {
            handle.slotGiven[id] = given[prop]
          }
          resolved[prop] = handle.slotCallbacks[id] ??= first(
            () => handle.slotGiven[id],
            relay(handle, tag, key, isAction(slotSchemas[slot][prop]))
          )
        }
        const listKey = keyProps[slot]
        if (listKey && resolved[listKey] !== undefined) {
          resolved.id = (
            instance.api as { internal: { keyOf: (value: unknown) => string } }
          ).internal.keyOf(resolved[listKey])
        }
        return resolved
      }
      const call = p.part(
        (builder: any, method: string, args: readonly unknown[]) =>
          builder.on("click", PrimitiveMessage.PressedCall({ method, args }))
      )
      const calls = new Proxy(
        {},
        {
          get: (_, method) =>
            typeof method === "string"
              ? View.wrapPart(call, (builder: any, ...args: unknown[]) =>
                  call(builder, method, args)
                )
              : undefined,
        }
      )
      handle.reads = []
      const track = <T>(again: () => T) => {
        const value = again()
        handle.reads.push({ value, again })
        return value
      }
      const build = (around: Around): Record<string, unknown> => {
        const result: Record<string, unknown> = {
          get state() {
            return stateSlot in definitions
              ? track(() => partState(instance.part(stateSlot)))
              : {}
          },
          calls,
          join: (handle.join ??= () => handle.instance?.api),
          in: (name: string, given?: Record<string, unknown>) => {
            const slot = slotOf(name)
            const resolved = resolve(slot, given, around)
            return build({
              ...around,
              [slot]: keyProps[slot]
                ? { ...resolved, value: resolved.id }
                : resolved,
            })
          },
        }
        for (const slot of slots) {
          const read = (given?: Record<string, unknown>) =>
            instance.part(slot, resolve(slot, given, around, false))
          result[nameOf(slot)] = Object.assign(
            View.wrapPart(
              decorated[slot],
              (builder: any, given?: Record<string, unknown>) => {
                const resolved = resolve(slot, given, around)
                const part = instance.part(slot, resolved)
                if (!track(() => isPresent(part))) {
                  return undefined
                }
                // Effect UI matches unkeyed siblings by position, so a part
                // that comes and goes, like a popup, would rebuild the parts
                // after it. A part keeps its node by a key of its own.
                const seen = `${slot}:${part.key}`
                const count = (occurrences[seen] = (occurrences[seen] ?? 0) + 1)
                const keyed =
                  builder.elementKey === undefined
                    ? builder.key(`ui-sdk:${seen}:${count}`)
                    : builder
                return decorated[slot](keyed, resolved)
              }
            ),
            {
              state: (given?: Record<string, unknown>) => {
                const part = read(given)
                return track(() => partState(part))
              },
            }
          )
        }
        return result
      }
      return build({})
    },
  } as any)

  return component as unknown as Component.Headless<
    EffectProps<P>,
    EffectEvents<P, Tags>,
    EffectParts<P, Tags, Present, Names, StateSlot>
  >
}

type CamelCase<S extends string> = S extends `${infer H}-${infer T}`
  ? `${H}${Capitalize<CamelCase<T>>}`
  : S

type CallbackKeys<O> = {
  [K in keyof O & string]-?: K extends `on${string}` | "action"
    ? NonNullable<O[K]> extends (...args: any[]) => any
      ? K
      : never
    : never
}[keyof O & string]

type Callback<P extends Primitive, K> =
  NonNullable<OptionsOf<P>[K & keyof OptionsOf<P>]> extends (
    ...args: infer A
  ) => any
    ? A
    : never

/**
 * The props an Effect UI component takes: the primitive's options without
 * its callbacks, which are events.
 * @experimental
 */
type EffectProps<P extends Primitive> = {
  readonly [K in keyof OptionsOf<P> & string]?: Loosen<
    OptionsOf<P>[K & keyof OptionsOf<P>]
  >
} & { readonly id?: string }

// An Effect UI Model's arrays are readonly, and core never writes to an
// option's, so a prop takes either.
type Loosen<T> = T extends (infer Item)[] ? readonly Item[] | T : T

/**
 * The events an Effect UI component emits, one per callback option:
 * `onOpenChange` is `OpenChange`, with the value, and the reason and source
 * of a change.
 * @experimental
 */
type EffectEvents<P extends Primitive, Tags = {}> =
  | {
      [K in CallbackKeys<OptionsOf<P>>]: {
        readonly _tag: EventName<K>
      } & Payload<Callback<P, K>>
    }[CallbackKeys<OptionsOf<P>>]
  | SlotEvents<P, Tags>

type EventName<K extends string> = K extends `on${infer Name}`
  ? Name
  : Capitalize<K>

// An action, like a button's, gets the DOM event first, which its event leaves out.
type WithoutEvent<A extends readonly unknown[]> = A extends readonly [
  infer First,
  ...infer Rest,
]
  ? [First] extends [Event | undefined]
    ? Rest
    : A
  : A

// What a callback's event carries: its value, and the reason and source of
// its details, which a callback like `onDismissAttempt` takes alone.
type Payload<A extends readonly unknown[]> = DetailsPayload<WithoutEvent<A>>

type DetailsPayload<A extends readonly unknown[]> = A extends readonly []
  ? { readonly value?: undefined; readonly source?: string }
  : A extends readonly [{ reason: string } | { source: string }]
    ? {
        readonly value?: undefined
        readonly reason?: ReasonOf<A[0]>
        readonly source?: string
      }
    : {
        readonly value: A[0]
        readonly reason?: ReasonOf<A[1]>
        readonly source?: string
      }

type ReasonOf<Details> = Details extends { reason: infer R } | undefined
  ? R
  : never

type SlotCallback<P extends Primitive, S extends SlotName<P>, K> =
  NonNullable<PropsOf<P, S>[K & keyof PropsOf<P, S>]> extends (
    ...args: infer A
  ) => any
    ? A
    : never

// The events of the slots' callback props, like an accordion item's
// `onOpenChange`, which is `ItemOpenChange` with the item's key.
type SlotEvents<P extends Primitive, Tags> = {
  [S in keyof Tags & SlotName<P>]: {
    [K in CallbackKeys<PropsOf<P, S>>]: {
      readonly _tag: `${Capitalize<CamelCase<S>>}${EventName<K>}`
      readonly key?: string
    } & Payload<SlotCallback<P, S, K>>
  }[CallbackKeys<PropsOf<P, S>>]
}[keyof Tags & SlotName<P>]

/**
 * A part: give it the builder of the element to render, and it returns the
 * builder with the part's attributes and behavior. A part whose slot decides
 * whether its element is in the page returns `undefined` while it shouldn't be.
 * @experimental
 */
type EffectPart<Props, State, Absent = never> = {
  <B extends View.PartTarget<string>>(
    builder: B,
    ...props: {} extends Props ? [props?: Props] : [props: Props]
  ): ReturnType<B["attr"]> | Absent
  /** The part's state for these props, like a star's for its value. */
  readonly state: (
    ...props: {} extends Props ? [props?: Props] : [props: Props]
  ) => State
}

/**
 * What a component's `view` closure gets: a part per slot and the state.
 * @experimental
 */
type EffectParts<
  P extends Primitive,
  Tags,
  Present = never,
  Names = {},
  StateSlot extends SlotName<P> = "root" & SlotName<P>,
> = {
  readonly [S in keyof Tags & SlotName<P> as PartNameOf<S, Names>]: EffectPart<
    PropsOf<P, S>,
    StateOf<P, S>,
    S extends Present ? undefined : never
  >
} & {
  readonly state: StateOf<P, StateSlot>
  /**
   * What a member passes to join this component, like a checkbox in a
   * group: `Checkbox(h, { props: { group: toppings.join } })`.
   */
  readonly join: () => ApiOf<P>
  /**
   * The parts inside one of the parts, like an accordion item's trigger and
   * panel, which take what they need from it, like its `value`.
   */
  readonly in: <N extends PartNameOf<keyof Tags & SlotName<P>, Names>>(
    part: N,
    ...props: {} extends PropsOf<P, SlotFor<P, Tags, Names, N>>
      ? [props?: PropsOf<P, SlotFor<P, Tags, Names, N>>]
      : [props: PropsOf<P, SlotFor<P, Tags, Names, N>>]
  ) => EffectParts<P, Tags, Present, Names, StateSlot>
  /**
   * A control of yours that calls one of the primitive's api methods when
   * pressed, like a button that rates 3: `rating.calls.rate(h.button, 3)`.
   * The call runs as a Command, so the message log names it.
   */
  readonly calls: {
    readonly [M in keyof ApiOf<P> & string]: ApiOf<P>[M] extends (
      ...args: infer A
    ) => any
      ? <B extends View.PartTarget<string>>(
          builder: B,
          ...args: Partial<A>
        ) => ReturnType<B["attr"]>
      : never
  }
}

// A slot's part name: its own in camel case, or the name `names` gives it.
type PartNameOf<S, Names> = S extends keyof Names
  ? Names[S] & string
  : CamelCase<S & string>

// The slot a part name stands for.
type SlotFor<P extends Primitive, Tags, Names, N> = {
  [S in keyof Tags & SlotName<P>]: PartNameOf<S, Names> extends N ? S : never
}[keyof Tags & SlotName<P>]

type ApiOf<P extends Primitive> = TypesOf<P>["api"] extends infer Api
  ? Api extends object
    ? Api
    : {}
  : {}

export {
  createParts,
  type EffectEvents,
  type EffectPart,
  type EffectParts,
  type EffectProps,
}
