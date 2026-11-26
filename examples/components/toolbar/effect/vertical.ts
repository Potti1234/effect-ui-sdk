import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toggle, ToggleGroup } from "@ui-sdk/effect/toggle"
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
const MousePointer2 = icon([
  [
    "path",
    {
      d: "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
    },
  ],
])
const Pencil = icon([
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
    },
  ],
  ["path", { d: "m15 5 4 4" }],
])
const Square = icon([
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
])
const Type = icon([
  ["path", { d: "M12 4v16" }],
  ["path", { d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" }],
  ["path", { d: "M9 20h6" }],
])
const Trash = icon([
  ["path", { d: "M10 11v6" }],
  ["path", { d: "M14 11v6" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
  ["path", { d: "M3 6h18" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
])

const tools = [
  { value: "select", label: "Select", icon: MousePointer2 },
  { value: "draw", label: "Draw", icon: Pencil },
  { value: "shape", label: "Shape", icon: Square },
  { value: "text", label: "Text", icon: Type },
]

const ExampleMessage = UiSchema.TaggedEnum({
  ChangedTool: { value: Schema.String },
  PressedDelete: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    ChangedTool: ($, { value }) =>
      $.set(null).run(
        log(`${tools.find((tool) => tool.value === value)?.label} tool`)
      ),
    PressedDelete: ($) => $.set(null).run(log("Deleted selection")),
  },
  view: (h) =>
    Toolbar(h, {
      props: { orientation: "vertical" },
      view: (toolbar) =>
        toolbar.root(h.div.attr("aria-label", "Canvas")).children(
          ToggleGroup(h, {
            props: {
              defaultValue: ["select"],
              deselectable: false,
              orientation: "vertical",
              toolbar: toolbarScope(toolbar.join),
            },
            onEmit: (event) =>
              event._tag === "ValueChange"
                ? ExampleMessage.ChangedTool({
                    value: (event.value as string[])[0],
                  })
                : undefined,
            view: (group) =>
              group.group(h.div.attr("aria-label", "Tool")).children(
                tools.map((tool) =>
                  Toggle(h, {
                    key: tool.value,
                    props: { value: tool.value, group: group.join },
                    view: (toggle) =>
                      toggle
                        .root(h.button.attr("aria-label", tool.label))
                        .children(toggle.icon(h.span.children(tool.icon(h)))),
                  })
                )
              ),
          }),
          toolbar.separator(h.div),
          toolbar
            .button(
              h.button
                .attr("aria-label", "Delete")
                .on("click", ExampleMessage.PressedDelete())
            )
            .children(Trash(h))
        ),
    }),
})

export { Example }
