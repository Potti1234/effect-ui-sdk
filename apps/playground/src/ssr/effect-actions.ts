// A Button's `action` runs in core's own listener, which returns its Promise
// to core for the pending state, and has no event of its own. It reports
// what it did through `report`, which the `subscription` relays to `update`.
import * as Subscription from "@effect/ui/Subscription"
import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Stream from "effect/Stream"

function createActions<Message>() {
  const listeners = new Set<(message: Message) => void>()
  const subscription = Subscription.make(
    "ButtonActions",
    Stream.callback<Message>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const listener = (message: Message) =>
            Queue.offerUnsafe(queue, message)
          listeners.add(listener)
          return listener
        }),
        (listener) => Effect.sync(() => listeners.delete(listener))
      )
    )
  )
  return {
    report: (message: Message) =>
      listeners.forEach((listener) => listener(message)),
    subscription,
  }
}

export { createActions }
