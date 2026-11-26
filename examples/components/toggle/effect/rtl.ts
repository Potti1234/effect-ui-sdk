import * as Html from "@effect/ui/html/Html"
import { Toggle } from "@ui-sdk/effect/toggle"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("dir", "rtl").children(
      Toggle(h, {
        view: (toggle) =>
          toggle.root(h.button).children(
            toggle.icon(
              h.span.attr("data-variant", "fill").children(
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
                  .children(
                    h
                      .el("path")
                      .attr(
                        "d",
                        "M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"
                      )
                  )
              )
            ),
            "إشارة مرجعية"
          ),
      })
    ),
})

export { Example }
