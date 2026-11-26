// @vitest-environment happy-dom
import * as Html from "@effect/ui/html/Html"
import * as HtmlServer from "@effect/ui/html/HtmlServer"
import { definePrimitive } from "@ui-sdk/core"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { createParts } from "../src/primitive"

const stepper = definePrimitive({
  name: "stepper",
  state: () => ({}),
  api: () => ({}),
  slots: (slot) => ({
    root: slot({}),
    next: slot({
      attrs: () => ({ type: "button", "aria-label": "Next step" }),
    }),
  }),
})

const Stepper = createParts(stepper, {
  name: "Stepper",
  tags: { root: "div", next: "button" },
})

const Page = Html.component({
  name: "Page",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Stepper(h, {
      view: (stepper) =>
        stepper
          .root(h.div)
          .children(
            stepper.next(h.button.attr("aria-label", "Étape suivante")),
            stepper.next(h.button)
          ),
    }),
})

test("a name the author gives replaces the part's own, and the part's stays without one", async () => {
  const { html } = await Effect.runPromise(HtmlServer.renderToHtml(Page, {}))
  expect(html).toContain('aria-label="Étape suivante"')
  expect(html).toContain('aria-label="Next step"')
  expect(html.match(/aria-label=/g)).toHaveLength(2)
})
