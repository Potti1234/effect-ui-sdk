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

const list = definePrimitive({
  name: "made-list",
  state: () => ({}),
  api: () => ({}),
  slots: (slot) => ({
    item: slot<{ value?: string }>({
      props: { value: "id" },
      attrs: (_state, { props }) => ({ "data-value": props.value }),
    }),
    title: slot<{ value?: string }>({
      props: { value: { kind: "string", from: "item" } },
      attrs: (_state, { props }) => ({ "data-item": props.value }),
    }),
  }),
})

const MadeList = createParts(list, {
  name: "MadeList",
  tags: { item: "li", title: "span" },
})

const ListPage = Html.component({
  name: "ListPage",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    MadeList(h, {
      view: (madeList) =>
        h.ul.children(
          ...["First", "Second"].map((text) => {
            const item = madeList.in("item")
            return item.item(h.li).children(item.title(h.span).children(text))
          })
        ),
    }),
})

test("a part inside in() of its own slot takes the id in() made", async () => {
  const { html } = await Effect.runPromise(
    HtmlServer.renderToHtml(ListPage, {})
  )
  const values = [...html.matchAll(/ data-value="([^"]+)"/g)].map(([, v]) => v)
  const items = [...html.matchAll(/ data-item="([^"]+)"/g)].map(([, v]) => v)
  expect(values).toHaveLength(2)
  expect(new Set(values).size).toBe(2)
  expect(items).toEqual(values)
})
