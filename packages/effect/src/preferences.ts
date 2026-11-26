import { preferencesScript, type PreferenceLike } from "@ui-sdk/core"
import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as Mount from "@effect/ui/Mount"
import * as Subscription from "@effect/ui/Subscription"
import * as Html from "@effect/ui/html/Html"
import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"

type Readable<State> = {
  attribute?: string
  get: () => State
  subscribe: (listener: () => void) => () => void
}

type Writable = { set: (value: never) => unknown }

const isPreference = (value: unknown): value is PreferenceLike =>
  typeof value === "object" && value !== null && "attribute" in value

/**
 * A preference's state, like `{ value: "dark" }`, sent as a message while a
 * component's `subscriptions` lists it: the saved value once it starts, then
 * every change. Start the Model from `preference.initialState`, which the
 * server renders, so the page hydrates without a mismatch.
 * @experimental
 */
function preference<State, Msg>(
  preference: Readable<State>,
  toMessage: (state: State) => Msg
) {
  return Subscription.make(
    `preference:${preference.attribute ?? "state"}`,
    Stream.callback<Msg>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const send = () =>
            Queue.offerUnsafe(queue, toMessage(preference.get()))
          const stop = preference.subscribe(send)
          send()
          return stop
        }),
        (stop) => Effect.sync(stop)
      )
    )
  )
}

const SetPreference = Command.make(
  "SetPreference",
  {
    args: {
      preference: Schema.declare(
        (value: unknown): value is Writable =>
          typeof value === "object" && value !== null && "set" in value
      ),
      value: Schema.String,
    },
  },
  ({ preference, value }) =>
    Effect.sync(() => {
      ;(preference.set as (value: string) => unknown)(value)
      return Component.noop
    })
)

/**
 * Saves a preference's value, like the color scheme a switcher picked, as a
 * Command, so the message log names it: `$.run(setPreference(colorScheme, "dark"))`.
 * @experimental
 */
const setPreference = <Value extends string>(
  preference: { set: (value: Value) => unknown },
  value: NoInfer<Value>
) => SetPreference.make({ preference, value })

// Writes each preference's value on its attribute for as long as the
// element is in the page: global ones on `<html>`, the rest on the element.
const ShowPreferences = Mount.makeStream(
  "ShowPreferences",
  { args: { preferences: Schema.Array(Schema.declare(isPreference)) } },
  (node: HTMLElement, { preferences: list }) =>
    Stream.callback<never>(() =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const write = () => {
            for (const item of list) {
              ;(item.global ? document.documentElement : node).setAttribute(
                item.attribute,
                item.get().value
              )
            }
          }
          const stops = list.map((item) => item.subscribe(write))
          write()
          return stops
        }),
        (stops) => Effect.sync(() => stops.forEach((stop) => stop()))
      )
    )
)

/**
 * Shows preferences on `data-*` attributes, so CSS styles by them from the
 * first paint: global ones on `<html>`, the rest on its own element, which
 * has `display: contents`. It renders one inline script as its first
 * child, which puts every saved value on its attribute as the server's page
 * loads, before hydration. Give it your app as children:
 * `Preferences(h, { preferences: [colorScheme] }).children(...)`.
 * @experimental
 */
function Preferences<M>(
  h: Html.H<M>,
  options: { preferences: readonly PreferenceLike[]; nonce?: string }
) {
  const shown: Record<string, string> = {}
  for (const item of options.preferences) {
    if (!item.global) {
      shown[item.attribute] = item.initialState.value
    }
  }
  return h.div
    .attrs({ ...shown, "data-slot": "preferences", style: "display:contents" })
    .onMount(ShowPreferences({ preferences: options.preferences }))
    .children(
      h
        .el("script")
        .attr("nonce", options.nonce)
        .children(preferencesScript(options.preferences))
    )
}

export {
  createColorScheme,
  createPointerKind,
  createPreference,
  preferencesScript,
} from "@ui-sdk/core"
export type { PreferenceLike } from "@ui-sdk/core"

export { preference, Preferences, setPreference }
