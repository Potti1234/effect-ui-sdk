import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attrs({ "data-slot": "row", dir: "rtl" }).children(
      Button(h, {
        key: "continue",
        view: (button) =>
          button.root(h.button).children(
            "متابعة",
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
              .children(h.el("path").attr("d", "m9 18 6-6-6-6"))
          ),
      }),
      Button(h, {
        key: "cancel",
        view: (button) => button.root(h.button).children("إلغاء"),
      })
    ),
})

export { Example }
