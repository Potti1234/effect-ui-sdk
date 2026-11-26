// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import * as HtmlServer from "@effect/ui/html/HtmlServer"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import {
  createPreference,
  preference,
  Preferences,
  setPreference,
} from "../src/preferences"
import { shortcut } from "../src/shortcuts"

const tick = () => new Promise((resolve) => setTimeout(resolve, 40))

const sidebar = createPreference({
  values: ["open", "closed"],
  defaultValue: "open",
  attribute: "data-sidebar",
})

const PageMessage = UiSchema.TaggedEnum({
  ChangedSidebar: { value: Schema.String },
  ClickedClose: {},
  PressedSearch: {},
})

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ sidebar: Schema.String, searches: Schema.Number }),
  message: PageMessage,
}).make({
  init: () => ({ sidebar: sidebar.initialState.value, searches: 0 }),
  update: {
    ChangedSidebar: ($, { value }) => $.evolve({ sidebar: value }),
    ClickedClose: ($) => $.run(setPreference(sidebar, "closed")),
    PressedSearch: ($) => $.evolve({ searches: (n) => n + 1 }),
  },
  subscriptions: () => [
    preference(sidebar, ({ value }) => PageMessage.ChangedSidebar({ value })),
    shortcut("mod+k", PageMessage.PressedSearch()),
  ],
  view: (h, model) =>
    Preferences(h, { preferences: [sidebar] }).children(
      h.aside.attr("hidden", model.sidebar === "closed" ? "" : undefined),
      h.button.on("click", PageMessage.ClickedClose()).children("Close"),
      h.output.children(String(model.searches))
    ),
})

test("a preference reaches the Model, a Command saves it, and a shortcut sends its message", async () => {
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
  const shown = app.querySelector('[data-slot="preferences"]')!
  expect(shown.getAttribute("data-sidebar")).toBe("open")
  expect(app.querySelector("aside")!.hidden).toBe(false)
  app.querySelector("button")!.click()
  await tick()
  expect(shown.getAttribute("data-sidebar")).toBe("closed")
  expect(app.querySelector("aside")!.hidden).toBe(true)
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
  )
  await tick()
  expect(app.querySelector("output")!.textContent).toBe("1")
})

test("the server renders the script that shows saved preferences before hydration", async () => {
  const { html } = await Effect.runPromise(HtmlServer.renderToHtml(Page, {}))
  expect(html).toContain('data-sidebar="open"')
  expect(html).toMatch(/<script>[\s\S]*?"data-sidebar"[\s\S]*?<\/script>/)
})
