import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toolbar } from "@ui-sdk/effect/toolbar"
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
const Scissors = icon([
  ["circle", { cx: "6", cy: "6", r: "3" }],
  ["path", { d: "M8.12 8.12 12 12" }],
  ["path", { d: "M20 4 8.12 15.88" }],
  ["circle", { cx: "6", cy: "18", r: "3" }],
  ["path", { d: "M14.8 14.8 20 20" }],
])
const Copy = icon([
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
])
const Clipboard = icon([
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
    },
  ],
])
const Undo = icon([
  ["path", { d: "M3 7v6h6" }],
  ["path", { d: "M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" }],
])
const Redo = icon([
  ["path", { d: "M21 7v6h-6" }],
  ["path", { d: "M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" }],
])

const clipboard = [
  { label: "Cut", icon: Scissors },
  { label: "Copy", icon: Copy },
  { label: "Paste", icon: Clipboard },
]

const ExampleMessage = UiSchema.TaggedEnum({
  PressedItem: { label: Schema.String },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    PressedItem: ($, { label }) => $.set(null).run(log(label)),
  },
  view: (h) =>
    Toolbar(h, {
      view: (toolbar) => {
        const edit = toolbar.in("group")
        const history = toolbar.in("group", { disabled: true })
        return toolbar.root(h.div.attr("aria-label", "Edit")).children(
          toolbar.group(h.div.attr("aria-label", "Clipboard")).children(
            clipboard.map((item) =>
              edit
                .button(
                  h.button
                    .key(item.label)
                    .attr("aria-label", item.label)
                    .on(
                      "click",
                      ExampleMessage.PressedItem({ label: item.label })
                    )
                )
                .children(item.icon(h))
            )
          ),
          toolbar.separator(h.div),
          toolbar
            .group(h.div.attr("aria-label", "History"), { disabled: true })
            .children(
              history
                .button(h.button.attr("aria-label", "Undo"))
                .children(Undo(h)),
              history
                .button(h.button.attr("aria-label", "Redo"))
                .children(Redo(h))
            )
        )
      },
    }),
})

export { Example }
