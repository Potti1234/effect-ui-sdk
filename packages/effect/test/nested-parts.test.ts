// @vitest-environment happy-dom
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import * as HtmlServer from "@effect/ui/html/HtmlServer"
import { accordion } from "@ui-sdk/core/accordion"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { createParts } from "../src/primitive"

const tick = () => new Promise((resolve) => setTimeout(resolve, 30))

const Accordion = createParts(accordion, {
  name: "Accordion",
  tags: {
    root: "div",
    item: "div",
    header: "h3",
    trigger: "button",
    panel: "div",
  },
  present: ["panel"],
})

const sections = [
  { value: "shipping", title: "Shipping", body: "Ships in 2 days." },
  { value: "returns", title: "Returns", body: "Free for 30 days." },
]

const Page = Html.component({
  name: "Page",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Accordion(h, {
      view: (accordion) =>
        accordion.root(h.div).children(
          sections.map((section) => {
            const item = accordion.in("item", { value: section.value })
            return accordion
              .item(h.div.key(section.value), { value: section.value })
              .children(
                item
                  .header(h.h3)
                  .children(item.trigger(h.button).children(section.title)),
                item.panel(h.div.class("panel").children(section.body))
              )
          })
        ),
    }),
})

test("parts inside an item take its value, and arrow keys leave focus where it is", async () => {
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
  const [shipping, returns] = app.querySelectorAll("button")
  expect(shipping.getAttribute("aria-expanded")).toBe("false")
  expect(app.querySelectorAll(".panel")).toHaveLength(0)
  returns.click()
  await tick()
  expect(returns.getAttribute("aria-expanded")).toBe("true")
  expect(shipping.getAttribute("aria-expanded")).toBe("false")
  const panel = app.querySelector(".panel")!
  expect(panel.textContent).toBe("Free for 30 days.")
  expect(returns.getAttribute("aria-controls")).toBe(panel.id)
  shipping.focus()
  shipping.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
  )
  expect(document.activeElement).toBe(shipping)
})

test("the server renders each item's parts with ids that point at each other", async () => {
  const { html } = await Effect.runPromise(HtmlServer.renderToHtml(Page, {}))
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(html).toContain('data-slot="accordion-trigger"')
  expect(html.match(/aria-expanded="false"/g)).toHaveLength(2)
})
