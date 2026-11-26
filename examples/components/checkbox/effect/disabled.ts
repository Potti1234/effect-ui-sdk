import * as Html from "@effect/ui/html/Html"
import { Checkbox } from "@ui-sdk/effect/checkbox"
import * as Schema from "effect/Schema"

const settings = [
  { label: "Product updates", disabled: false },
  { label: "Security alerts", disabled: true },
]

const Check = <M>(h: Html.H<M>) =>
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
    .children(h.el("path").attr("d", "M20 6 9 17l-5-5"))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("data-slot", "stack").children(
      settings.map((setting) =>
        Checkbox(h, {
          key: setting.label,
          props: { defaultChecked: true, disabled: setting.disabled },
          view: (checkbox) =>
            h.label
              .attr("data-slot", "label")
              .children(
                checkbox
                  .root(h.button)
                  .children(checkbox.indicator(h.span.children(Check(h)))),
                checkbox.input(h.input),
                setting.label
              ),
        })
      )
    ),
})

export { Example }
