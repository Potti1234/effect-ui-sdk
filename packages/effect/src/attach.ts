import type * as Component from "@effect/ui/Component"
import * as Mount from "@effect/ui/Mount"
import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"

type Run = (
  el: HTMLElement,
  send: (message: unknown) => void
) => (() => void) | void

const isFunction = (value: unknown): value is Run => typeof value === "function"

const sameDeps = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((value, index) => Object.is(value, b[index]))

// Runs a behavior on the element while it's in the page, and again when its
// deps change, after stopping the run before.
const Attach = Mount.makeStream(
  "Attach",
  {
    args: {
      run: Schema.declare(isFunction),
      deps: Schema.Array(Schema.Unknown),
    },
  },
  (node: HTMLElement, args, changes) =>
    Stream.callback<unknown>(
      Effect.fnUntraced(function* (queue) {
        const send = (message: unknown) => Queue.offerUnsafe(queue, message)
        let deps = args.deps
        let stop = args.run(node, send)
        yield* Effect.addFinalizer(() => Effect.sync(() => stop?.()))
        yield* Stream.runForEach(changes, (next) =>
          Effect.sync(() => {
            if (sameDeps(deps, next.deps)) {
              return
            }
            stop?.()
            deps = next.deps
            stop = next.run(node, send)
          })
        ).pipe(Effect.forkScoped)
      })
    )
)

/**
 * Runs a behavior on an element while it's in the page, the way a ref
 * callback does: `h.div.onMount(attach((el) => bindDrag(el, options)))`. What
 * `run` returns stops it when the element leaves, or before it runs again
 * because `deps` changed. `send` sends a message to the component, so a
 * behavior's callback, like `bindScrollPicker`'s `onSelect`, reaches `update`.
 * @experimental
 */
function attach<Msg = never>(
  run: (el: HTMLElement, send: (message: Msg) => void) => (() => void) | void,
  deps: readonly unknown[] = []
) {
  return Attach({ run: run as Run, deps }) as unknown as Mount.Issued<
    Msg | Component.Noop,
    never,
    HTMLElement,
    never
  >
}

export { attach }
