// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { Collapsible } from "../src/collapsible"
import { attach } from "../src/primitive"

const tick = () => new Promise((resolve) => setTimeout(resolve, 40))

let running = 0

const PageMessage = UiSchema.TaggedEnum({
  DoubleClickedTrigger: {},
  ClickedHide: {},
})

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ doubles: Schema.Number, shown: Schema.Boolean }),
  message: PageMessage,
}).make({
  init: () => ({ doubles: 0, shown: true }),
  update: {
    DoubleClickedTrigger: ($) => $.evolve({ doubles: (n) => n + 1 }),
    ClickedHide: ($) => $.evolve({ shown: false }),
  },
  view: (h, model) =>
    h.div(
      model.shown &&
        Collapsible(h, {
          view: (collapsible) =>
            collapsible.root(h.div).children(
              collapsible
                .trigger(
                  h.button.class("trigger").onMount(
                    attach<typeof PageMessage.Type>((el, send) => {
                      running++
                      const listener = () =>
                        send(PageMessage.DoubleClickedTrigger())
                      el.addEventListener("dblclick", listener)
                      return () => {
                        running--
                        el.removeEventListener("dblclick", listener)
                      }
                    })
                  )
                )
                .children("Details"),
              collapsible.panel(h.div.class("panel").children("Content"))
            ),
        }),
      h.button.class("hide").on("click", PageMessage.ClickedHide()),
      h.output.children(String(model.doubles))
    ),
})

test("a behavior attached to a part's element runs beside the part, and stops when it leaves", async () => {
  const app = document.body.appendChild(document.createElement("div"))
  Effect.runFork(
    Effect.scoped(
      Effect.gen(function* () {
        yield* BrowserHost.mountEffect(Page, {}, app)
        yield* Effect.never
      })
    ) as Effect.Effect<never>
  )
  await tick()
  const trigger = app.querySelector<HTMLButtonElement>(".trigger")!
  expect(running).toBe(1)
  trigger.click()
  await tick()
  expect(trigger.getAttribute("aria-expanded")).toBe("true")
  trigger.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }))
  await tick()
  expect(app.querySelector("output")!.textContent).toBe("1")
  app.querySelector<HTMLButtonElement>(".hide")!.click()
  await tick()
  expect(app.querySelector(".trigger")).toBeNull()
  expect(running).toBe(0)
})
