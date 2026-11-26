import * as Html from "@effect/ui/html/Html"
import { Toggle, ToggleGroup } from "@ui-sdk/effect/toggle"
import * as Schema from "effect/Schema"

const icon =
  (paths: string[]) =>
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
      .children(paths.map((d) => h.el("path").attr("d", d)))
const TextAlignCenter = icon(["M21 5H3", "M17 12H7", "M19 19H5"])
const TextAlignEnd = icon(["M21 5H3", "M21 12H9", "M21 19H7"])
const TextAlignStart = icon(["M21 5H3", "M15 12H3", "M17 19H3"])

const alignments = [
  { value: "start", label: "Align start", icon: TextAlignStart, mirror: true },
  {
    value: "center",
    label: "Align center",
    icon: TextAlignCenter,
    mirror: false,
  },
  { value: "end", label: "Align end", icon: TextAlignEnd, mirror: true },
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
      props: { defaultValue: ["start"], deselectable: false },
      view: (group) =>
        group.group(h.div.attr("aria-label", "Text alignment")).children(
          alignments.map((item) =>
            Toggle(h, {
              key: item.value,
              props: { value: item.value, group: group.join },
              view: (toggle) =>
                toggle.root(h.button.attr("aria-label", item.label)).children(
                  toggle.icon(h.span.children(item.icon(h)), {
                    mirror: item.mirror,
                  })
                ),
            })
          )
        ),
    }),
})

export { Example }
