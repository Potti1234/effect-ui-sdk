import type {
  OptionsOf,
  Part,
  Primitive,
  PrimitiveInstance,
  PropsOf,
  SlotName,
  StateOf,
} from "@ui-sdk/core"
import {
  attrs as partAttrs,
  bind,
  keep,
  partState,
  present as isPresent,
  release,
  renderVersion,
  schemaOf,
  takeOwnId,
  unwatched,
  yieldToAuthor,
} from "@ui-sdk/core/renderer"
import type * as Component from "@effect/ui/Component"
import * as Html from "@effect/ui/html/Html"
import * as Mount from "@effect/ui/Mount"
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
}

// What one instance of a component holds outside its Model: the core
// instance, the options its last render passed, and the parts it rendered.
class Handle {
  instance: PrimitiveInstance | undefined
  options: Record<string, unknown> | undefined
  callbacks:
    Record<string, (value: unknown, details?: Details) => void> | undefined
  parts = new Map<string, Part>()
  emit: ((call: Call) => void) | undefined
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
  },
})

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

const isCallback = (spec: unknown) => kindOf(spec) === "callback"

const eventName = (option: string) => option.slice(2)

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
        const follow = ({ handle, part }: typeof args) => {
          const next = handle.parts.get(part)
          if (next === bound) {
            return
          }
          unbind()
          bound = next
          unbind = next ? bind(next, node, host) : () => {}
        }
        follow(args)
        yield* Effect.addFinalizer(() => Effect.sync(() => unbind()))
        yield* Stream.runForEach(changes, (next) =>
          Effect.sync(() => follow(next))
        ).pipe(Effect.forkScoped)
      })
    )
)

// The root keeps the instance while its element is in the page, reports
// every change that affects rendering, and relays the instance's callbacks.
const KeepInstance = Mount.makeStream(
  "KeepInstance",
  { args: { handle: HandleArg, part: Schema.String } },
  (node: HTMLElement, { handle, part }) =>
    Stream.callback<PrimitiveMessage>(
      Effect.fnUntraced(function* (queue) {
        const instance = handle.instance!
        const root = handle.parts.get(part)!
        let version = renderVersion(instance)
        const changed = () => {
          const next = renderVersion(instance)
          if (next !== version) {
            version = next
            Queue.offerUnsafe(queue, PrimitiveMessage.ChangedState({ version }))
          }
        }
        handle.emit = (call) =>
          Queue.offerUnsafe(queue, PrimitiveMessage.CalledCallback(call))
        keep(instance)
        const unsubscribe = instance.subscribe(changed)
        const unbind = bind(root, node, host)
        changed()
        yield* Effect.addFinalizer(() =>
          Effect.sync(() => {
            unbind()
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
)

// Callbacks the instance calls, which the root relays as messages once it's
// in the page. Their details become plain data: what changed, why and how.
function callbacksOf(handle: Handle, names: string[]) {
  return (handle.callbacks ??= Object.fromEntries(
    names.map((name) => [
      name,
      (value: unknown, details?: Details) => {
        handle.emit?.({
          name,
          value,
          ...(details?.reason === undefined ? {} : { reason: details.reason }),
          ...(details?.source === undefined ? {} : { source: details.source }),
        })
      },
    ])
  ))
}

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
  for (const name in result) {
    if (result[name] === undefined && author[name] === undefined) {
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
>(
  primitive: P,
  options: { name: string; tags: Tags; present?: readonly Present[] }
) {
  const schema = schemaOf(primitive) as {
    options: Record<string, unknown>
  }
  const optionNames = Object.keys(schema.options).filter(
    (name) => name !== "debug"
  )
  const callbacks = optionNames.filter((name) =>
    isCallback(schema.options[name])
  )
  const fields: Schema.Struct.Fields = Object.fromEntries([
    ["id", Schema.optional(Schema.String)],
    ...optionNames
      .filter((name) => !isCallback(schema.options[name]))
      .map((name) => [
        name,
        Schema.optional(
          propSchemas[kindOf(schema.options[name])] ?? Schema.Unknown
        ),
      ]),
  ])
  const props = Schema.Struct(fields) as unknown as Schema.Codec<
    Record<string, unknown>
  >
  const events = UiSchema.TaggedEnum(
    Object.fromEntries(
      callbacks.map((name) => [
        eventName(name),
        {
          value: Schema.Unknown,
          reason: Schema.optional(Schema.String),
          source: Schema.optional(Schema.String),
        },
      ])
    )
  ) as any
  const slots = Object.keys(options.tags)
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
    const next: Record<string, unknown> = {
      ...given,
      ...callbacksOf(handle, callbacks),
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
    update: {
      ChangedState: ($: any, { version }: { version: number }) =>
        $.evolve({ version }),
      CalledCallback: ($: any, { name, ...payload }: Call) =>
        $.emit(events[eventName(name)](payload)),
    },
    parts: (p: any, model: typeof PrimitiveModel.Type) => {
      const { handle } = model
      const instance = instanceOf(handle, p.props, `ui-sdk-${p.id("ui")}`)
      const result: Record<string, unknown> = {
        state: partState(instance.part("root")),
      }
      for (const slot of slots) {
        const decorated = p.part(
          (builder: any, slotProps: Record<string, unknown> = {}) => {
            const part = instance.part(slot, slotProps)
            const mapKey = `${slot}:${part.key}`
            handle.parts.set(mapKey, part)
            const mount =
              slot === "root"
                ? KeepInstance({ handle, part: mapKey })
                : BindPart({ handle, part: mapKey })
            return builder.onMount(mount).forward((node: any) => {
              const author = node.elementAttrs as Record<string, string>
              takeOwnId(part, author.id)
              return node.attrs(merge(partAttrs(part, slotProps), author))
            })
          }
        )
        result[camel(slot)] = View.wrapPart(
          decorated,
          (builder: any, slotProps: Record<string, unknown> = {}) =>
            isPresent(instance.part(slot, slotProps))
              ? decorated(builder, slotProps)
              : undefined
        )
      }
      return result
    },
  } as any)

  return component as unknown as Component.Headless<
    EffectProps<P>,
    EffectEvents<P>,
    EffectParts<P, Tags, Present>
  >
}

type CamelCase<S extends string> = S extends `${infer H}-${infer T}`
  ? `${H}${Capitalize<CamelCase<T>>}`
  : S

type CallbackKeys<O> = {
  [K in keyof O & string]-?: K extends `on${string}`
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
  readonly [
    K in Exclude<keyof OptionsOf<P> & string, CallbackKeys<OptionsOf<P>>>
  ]?: OptionsOf<P>[K & keyof OptionsOf<P>]
} & { readonly id?: string }

/**
 * The events an Effect UI component emits, one per callback option:
 * `onOpenChange` is `OpenChange`, with the value, and the reason and source
 * of a change.
 * @experimental
 */
type EffectEvents<P extends Primitive> = {
  [K in CallbackKeys<OptionsOf<P>>]: K extends `on${infer Name}`
    ? {
        readonly _tag: Name
        readonly value: Callback<P, K>[0]
        readonly reason?: Callback<P, K>[1] extends
          { reason: infer R } | undefined
          ? R
          : never
        readonly source?: string
      }
    : never
}[CallbackKeys<OptionsOf<P>>]

/**
 * A part: give it the builder of the element to render, and it returns the
 * builder with the part's attributes and behavior. A part whose slot decides
 * whether its element is in the page returns `undefined` while it shouldn't be.
 * @experimental
 */
type EffectPart<Props, Absent = never> = <B extends View.PartTarget<string>>(
  builder: B,
  ...props: {} extends Props ? [props?: Props] : [props: Props]
) => ReturnType<B["attr"]> | Absent

/**
 * What a component's `view` closure gets: a part per slot and the state.
 * @experimental
 */
type EffectParts<P extends Primitive, Tags, Present = never> = {
  readonly [S in keyof Tags & SlotName<P> as CamelCase<S>]: EffectPart<
    PropsOf<P, S>,
    S extends Present ? undefined : never
  >
} & { readonly state: StateOf<P, "root" & SlotName<P>> }

export {
  createParts,
  type EffectEvents,
  type EffectPart,
  type EffectParts,
  type EffectProps,
}
