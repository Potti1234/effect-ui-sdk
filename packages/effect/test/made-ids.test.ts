// @vitest-environment happy-dom
import * as Html from "@effect/ui/html/Html"
import * as HtmlServer from "@effect/ui/html/HtmlServer"
import { definePrimitive } from "@ui-sdk/core"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { createParts } from "../src/primitive"

const field = definePrimitive({
  name: "hint-field",
  state: () => ({}),
  api: () => ({}),
  slots: (slot) => ({
    root: slot({}),
    hint: slot<{ id?: string }>({
      props: { id: "id" },
      attrs: (_state, { props }) => ({ id: props.id }),
    }),
  }),
})

const HintField = createParts(field, {
  name: "HintField",
  tags: { root: "div", hint: "p" },
})

const Page = Html.component({
  name: "Page",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    HintField(h, {
      view: (hintField) =>
        hintField
          .root(h.div)
          .children(
            hintField.hint(h.p).children("First"),
            hintField.hint(h.p).children("Second"),
            hintField.hint(h.p, { id: "mine" }).children("Third")
          ),
    }),
})

test("an id prop left out is made once per part, the same on every render", async () => {
  const first = await Effect.runPromise(HtmlServer.renderToHtml(Page, {}))
  const second = await Effect.runPromise(HtmlServer.renderToHtml(Page, {}))
  const ids = [...first.html.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id)
  expect(ids).toHaveLength(3)
  expect(new Set(ids).size).toBe(3)
  expect(ids[0]).toMatch(/^ui-sdk-/)
  expect(ids[2]).toBe("mine")
  expect(second.html).toBe(first.html)
})
