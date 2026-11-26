// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import * as HtmlServer from "@effect/ui/html/HtmlServer"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { Collapsible } from "../src/collapsible"

const tick = () => new Promise((resolve) => setTimeout(resolve, 30))

const PageMessage = UiSchema.TaggedEnum({
  RequestedOpenDetails: { open: Schema.Boolean, reason: Schema.String },
})

const Controlled = Html.component({
  name: "Controlled",
  props: Schema.Struct({ refuse: Schema.Boolean }),
  model: Schema.Struct({
    open: Schema.Boolean,
    log: Schema.Array(Schema.String),
  }),
  message: PageMessage,
}).make({
  init: () => ({ open: false, log: [] }),
  update: {
    RequestedOpenDetails: ($, { open, reason }) =>
      $.evolve({
        open: $.props.refuse ? $.model.open : open,
        log: (log) => [...log, `${open} ${reason}`],
      }),
  },
  view: (h, model) =>
    h.div(
      Collapsible(h, {
        props: { open: model.open },
        onEmit: (event) =>
          event._tag === "OpenChange"
            ? PageMessage.RequestedOpenDetails({
                open: event.value as boolean,
                reason: event.reason ?? "",
              })
            : undefined,
        view: (collapsible) =>
          collapsible
            .root(h.div.class("root"))
            .children(
              collapsible
                .trigger(h.button.class("trigger"))
                .children("Details"),
              collapsible.panel(h.div.class("panel").children("Content"))
            ),
      }),
      h.output.class("log").children(model.log.join(","))
    ),
})

const Uncontrolled = Html.component({
  name: "Uncontrolled",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Collapsible(h, {
      props: { defaultOpen: false },
      view: (collapsible) =>
        collapsible
          .root(h.div)
          .children(
            collapsible
              .trigger(h.button.class("trigger"))
              .children(collapsible.state.open ? "Hide" : "Show"),
            collapsible.panel(h.section.attr("id", "mine").children("Content"))
          ),
    }),
})

function mount<P>(component: any, props: P) {
  const app = document.body.appendChild(document.createElement("div"))
  Effect.runFork(
    Effect.scoped(
      Effect.gen(function* () {
        yield* BrowserHost.mountEffect(component, props, app)
        yield* Effect.never
      })
    ) as Effect.Effect<never>
  )
  return app
}

test("an uncontrolled collapsible opens on a click and points at its panel", async () => {
  const app = mount(Uncontrolled, {})
  await tick()
  const trigger = app.querySelector<HTMLButtonElement>(".trigger")!
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
  expect(trigger.id).toMatch(/^ui-sdk-/)
  expect(app.querySelector("section")).toBeNull()
  trigger.click()
  await tick()
  expect(trigger.getAttribute("aria-expanded")).toBe("true")
  expect(trigger.textContent).toBe("Hide")
  const panel = app.querySelector("section")!
  expect(panel.id).toBe("mine")
  expect(trigger.getAttribute("aria-controls")).toBe("mine")
  expect(panel.getAttribute("data-slot")).toBe("collapsible-panel")
})

test("a controlled collapsible asks its parent, which can refuse", async () => {
  const app = mount(Controlled, { refuse: true })
  await tick()
  const trigger = app.querySelector<HTMLButtonElement>(".trigger")!
  trigger.click()
  await tick()
  expect(app.querySelector(".log")!.textContent).toBe("true trigger-press")
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
  expect(app.querySelector(".panel")).toBeNull()
})

test("a controlled collapsible opens when its parent agrees", async () => {
  const app = mount(Controlled, { refuse: false })
  await tick()
  const trigger = app.querySelector<HTMLButtonElement>(".trigger")!
  trigger.click()
  await tick()
  expect(trigger.getAttribute("aria-expanded")).toBe("true")
  expect(app.querySelector(".panel")!.textContent).toBe("Content")
})

test("the server renders the closed trigger with its ARIA", async () => {
  const { html } = await Effect.runPromise(
    HtmlServer.renderToHtml(Controlled, { refuse: false })
  )
  expect(html).toContain('aria-expanded="false"')
  expect(html).toContain('data-slot="collapsible-trigger"')
  expect(html).not.toContain("Content")
})

