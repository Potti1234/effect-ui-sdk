// @vitest-environment happy-dom
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Effect from "effect/Effect"
import { expect, test } from "vitest"
import { Example } from "../../../examples/core/effect/rating-state"

const tick = () => new Promise((resolve) => setTimeout(resolve, 40))

test("a control outside the parts calls the primitive's api through a Command", async () => {
  const app = document.body.appendChild(document.createElement("div"))
  Effect.runFork(
    Effect.scoped(
      Effect.gen(function* () {
        yield* BrowserHost.mountEffect(Example, {}, app)
        yield* Effect.never
      })
    ) as Effect.Effect<never>
  )
  await tick()
  const [set, reset] = app.querySelectorAll("button")
  const value = () => app.querySelector("output")!.textContent
  expect(value()).toBe("0")
  set.click()
  await tick()
  expect(value()).toBe("3")
  reset.click()
  await tick()
  expect(value()).toBe("0")
})
