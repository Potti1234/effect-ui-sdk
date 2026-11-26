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
    Toggle(h, {
      view: (toggle) =>
        toggle.root(h.button.attr("aria-label", "Favorite")).children(
          toggle.icon(
            h.span.children(
              h
                .el("svg")
                .attrs({
                  viewBox: "0 0 24 24",
                  fill: toggle.state.pressed ? "currentColor" : "none",
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
                      "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
                    )
                )
            )
          )
        ),
    }),
})

export { Example }
