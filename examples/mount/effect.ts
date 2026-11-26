import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"

type Root = Parameters<typeof BrowserHost.mount>[0]

// The docs preview shows logged messages in its console pane.
export function mount(module: { Example: unknown }, host: HTMLElement) {
  const logger = Logger.make(({ message }) =>
    host.dispatchEvent(
      new CustomEvent("example-log", {
        bubbles: true,
        detail: (Array.isArray(message) ? message : [message])
          .map(String)
          .join(" "),
      })
    )
  )
  const fiber = Effect.runFork(
    Layer.launch(
      BrowserHost.mount(module.Example as Root, {} as never, host).pipe(
        Layer.provide(Logger.layer([logger]))
      ) as Layer.Layer<never>
    )
  )
  return () => {
    Effect.runFork(Fiber.interrupt(fiber))
    host.replaceChildren()
  }
}
