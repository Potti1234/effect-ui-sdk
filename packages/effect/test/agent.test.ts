// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import { createAgent } from "@ui-sdk/core/agent"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { Collapsible } from "../src/collapsible"

Element.prototype.getAnimations ??= () => []

const tick = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms))

const PageMessage = UiSchema.TaggedEnum({
  RequestedOpenChangeDetails: {
    open: Schema.Boolean,
    reason: Schema.String,
    source: Schema.String,
  },
})

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ open: Schema.Boolean, reasons: Schema.String }),
  message: PageMessage,
}).make({
  init: () => ({ open: false, reasons: "" }),
  update: {
    RequestedOpenChangeDetails: ($, { open, reason, source }) =>
      $.evolve({
        open,
        reasons: (reasons) => `${reasons}${reason}/${source};`,
      }),
  },
  view: (h, model) =>
    h.div(
      Collapsible(h, {
        props: { open: model.open },
        onEmit: (event) =>
          event._tag === "OpenChange"
            ? PageMessage.RequestedOpenChangeDetails({
                open: event.value,
                reason: event.reason ?? "",
                source: event.source ?? "",
              })
            : undefined,
        view: (collapsible) =>
          collapsible
            .root(h.div)
            .children(
              collapsible.trigger(h.button).children("Order details"),
              collapsible.panel(h.div.class("panel").children("Ships Monday"))
            ),
      }),
      h.output.children(model.reasons)
    ),
})

test("an agent lists the component and acts on it through the Model", async () => {
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
  const agent = createAgent()
  const [entry] = agent.snapshot()
  expect(entry).toMatchObject({
    component: "collapsible",
    label: "Order details",
    actions: expect.arrayContaining(["setOpen"]),
  })
  const result = await agent.act({
    steps: [{ ref: entry.ref, action: "setOpen", args: [true] }],
  })
  expect(JSON.stringify(result)).not.toMatch(/didn't take/)
  await tick()
  expect(app.querySelector(".panel")!.textContent).toBe("Ships Monday")
  expect(app.querySelector("output")!.textContent).toBe("imperative/agent;")
})
