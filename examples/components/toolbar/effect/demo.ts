import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toggle } from "@ui-sdk/effect/toggle"
import { Toolbar, toolbarScope } from "@ui-sdk/effect/toolbar"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

type Shape = readonly [string, Record<string, string>]

const icon =
  (shapes: Shape[]) =>
  <M>(h: Html.H<M>) =>
    h
      .el("svg")
      .attrs({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "aria-hidden": "true",
      })
      .children(shapes.map(([tag, attrs]) => h.el(tag).attrs(attrs)))
const Bold = icon([
  [
    "path",
    {
      d: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8",
    },
  ],
])
const Italic = icon([
  ["line", { x1: "19", x2: "10", y1: "4", y2: "4" }],
  ["line", { x1: "14", x2: "5", y1: "20", y2: "20" }],
  ["line", { x1: "15", x2: "9", y1: "4", y2: "20" }],
])
const Underline = icon([
  ["path", { d: "M6 4v6a6 6 0 0 0 12 0V4" }],
  ["line", { x1: "4", x2: "20", y1: "20", y2: "20" }],
])
const Link = icon([
  [
    "path",
    { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" },
  ],
  [
    "path",
    { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
  ],
])

const styles = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Underline", icon: Underline },
]

const ExampleMessage = UiSchema.TaggedEnum({
  ChangedStyle: { label: Schema.String, pressed: Schema.Boolean },
  PressedInsertLink: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    ChangedStyle: ($, { label, pressed }) =>
      $.set(null).run(log(`${label} ${pressed ? "on" : "off"}`)),
    PressedInsertLink: ($) => $.set(null).run(log("Insert link")),
  },
  view: (h) =>
    Toolbar(h, {
      view: (toolbar) =>
        toolbar.root(h.div.attr("aria-label", "Formatting")).children(
          styles.map((style) =>
            Toggle(h, {
              key: style.label,
              props: { toolbar: toolbarScope(toolbar.join) },
              onEmit: (event) =>
                event._tag === "PressedChange"
                  ? ExampleMessage.ChangedStyle({
                      label: style.label,
                      pressed: event.value,
                    })
                  : undefined,
              view: (toggle) =>
                toggle
                  .root(h.button.attr("aria-label", style.label))
                  .children(toggle.icon(h.span.children(style.icon(h)))),
            })
          ),
          toolbar.separator(h.div),
          toolbar
            .button(
              h.button
                .attr("aria-label", "Insert link")
                .on("click", ExampleMessage.PressedInsertLink())
            )
            .children(Link(h))
        ),
    }),
})

export { Example }
