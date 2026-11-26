import { shortcuts, type ShortcutOptions } from "@ui-sdk/core/shortcuts"
import * as Subscription from "@effect/ui/Subscription"
import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Stream from "effect/Stream"

/**
 * A keyboard shortcut in the shared `shortcuts`, registered while a
 * component's `subscriptions` lists it, that sends `message` each time it's
 * pressed. List it only while it should work, like `model.editing &&
 * shortcut("mod+s", Message.PressedSave())`. The server registers nothing.
 * @stable
 */
function shortcut<Msg>(
  keys: string,
  message: Msg,
  options: ShortcutOptions = {}
) {
  return Subscription.make(
    `shortcut:${keys}`,
    Stream.callback<Msg>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() =>
          shortcuts.register(
            keys,
            () => Queue.offerUnsafe(queue, message),
            options
          )
        ),
        (unregister) => Effect.sync(unregister)
      )
    )
  )
}

export {
  ariaKeyshortcuts,
  formatShortcut,
  registerShortcut,
  shortcuts,
} from "@ui-sdk/core/shortcuts"
export type {
  ShortcutHandler,
  ShortcutInfo,
  ShortcutKeys,
  ShortcutOptions,
  Shortcuts,
} from "@ui-sdk/core/shortcuts"

export { shortcut }
