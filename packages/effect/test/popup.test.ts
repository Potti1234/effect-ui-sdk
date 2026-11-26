// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import { popover } from "@ui-sdk/core/popover"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { createParts } from "../src/primitive"

const tick = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms))

const Popover = createParts(popover, {
  name: "Popover",
  tags: { trigger: "button", content: "div", title: "h2", close: "button" },
  present: ["content"],
})

const PageMessage = UiSchema.TaggedEnum({
  RequestedOpenChangeDetails: { open: Schema.Boolean, reason: Schema.String },
})

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ open: Schema.Boolean, reasons: Schema.String }),
  message: PageMessage,
}).make({
  init: () => ({ open: false, reasons: "" }),
  update: {
    RequestedOpenChangeDetails: ($, { open, reason }) =>
      $.evolve({ open, reasons: (reasons) => `${reasons}${reason};` }),
  },
  view: (h, model) =>
    h.div(
      Popover(h, {
        props: { open: model.open },
        onEmit: (event) =>
          event._tag === "OpenChange"
            ? PageMessage.RequestedOpenChangeDetails({
                open: event.value as boolean,
                reason: event.reason ?? "",
              })
            : undefined,
        view: (details) =>
          h.div.children(
            details.trigger(h.button.class("trigger")).children("Details"),
            details.content(
              h.div
                .class("content")
                .children(
                  details.title(h.h2).children("Order details"),
                  h.p.children("Ships in 2 days."),
                  details.close(h.button.class("close")).children("Done")
                )
            )
          ),
      }),
      h.output.children(model.reasons)
    ),
})

test("a popup opens from its trigger, closes from its parts, and returns focus", async () => {
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
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
  expect(app.querySelector(".content")).toBeNull()
  trigger.focus()
  trigger.click()
  await tick()
  const content = app.querySelector<HTMLElement>(".content")!
  expect(content).not.toBeNull()
  expect(trigger.getAttribute("aria-expanded")).toBe("true")
  expect(trigger.getAttribute("aria-controls")).toBe(content.id)
  expect(content.getAttribute("aria-labelledby")).toBe(
    app.querySelector("h2")!.id
  )
  app.querySelector<HTMLButtonElement>(".close")!.click()
  await tick(120)
  expect(app.querySelector(".content")).toBeNull()
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
  expect(document.activeElement).toBe(trigger)
  expect(app.querySelector("output")!.textContent).toMatch(
    /^trigger-press;close-press;$/
  )
})
