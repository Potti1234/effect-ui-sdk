import * as Html from "@effect/ui/html/Html"
import { Toggle, ToggleGroup } from "@ui-sdk/effect/toggle"
import * as Schema from "effect/Schema"

const svg = <M>(h: Html.H<M>) =>
  h.el("svg").attrs({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  })

const line = <M>(
  h: Html.H<M>,
  x1: string,
  x2: string,
  y1: string,
  y2: string
) => h.el("line").attrs({ x1, x2, y1, y2 })

const formats = [
  {
    value: "bold",
    label: "Bold",
    icon: <M>(h: Html.H<M>) =>
      svg(h).children(
        h
          .el("path")
          .attr(
            "d",
            "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
          )
      ),
  },
  {
    value: "italic",
    label: "Italic",
    icon: <M>(h: Html.H<M>) =>
      svg(h).children(
        line(h, "19", "10", "4", "4"),
        line(h, "14", "5", "20", "20"),
        line(h, "15", "9", "4", "20")
      ),
  },
  {
    value: "underline",
    label: "Underline",
    icon: <M>(h: Html.H<M>) =>
      svg(h).children(
        h.el("path").attr("d", "M6 4v6a6 6 0 0 0 12 0V4"),
        line(h, "4", "20", "20", "20")
      ),
  },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    ToggleGroup(h, {
      props: { multiple: true },
      view: (group) =>
        group.group(h.div.attr("aria-label", "Text formatting")).children(
          formats.map((item) =>
            Toggle(h, {
              key: item.value,
              props: { value: item.value, group: group.join },
              view: (toggle) =>
                toggle
                  .root(h.button.attr("aria-label", item.label))
                  .children(toggle.icon(h.span.children(item.icon(h)))),
            })
          )
        ),
    }),
})

export { Example }
