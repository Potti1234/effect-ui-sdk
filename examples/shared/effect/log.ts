import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Log = Command.make(
  "Log",
  { args: { message: Schema.String } },
  ({ message }) => Effect.log(message).pipe(Effect.as(Component.noop))
)

function log(message: string) {
  return Log.make({ message })
}

export { log }
