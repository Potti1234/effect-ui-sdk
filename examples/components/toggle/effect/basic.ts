import * as Html from "@effect/ui/html/Html"
import { Toggle } from "@ui-sdk/effect/toggle"
import * as Schema from "effect/Schema"

const Star = <M>(h: Html.H<M>) =>
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
          "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        )
    )

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("data-slot", "card").children(
      h.div
        .attr("data-slot", "stack")
        .children(
          h.h3.children("Q3 Roadmap"),
          h.p.attr("data-slot", "hint").children("Edited by Hollis Grant")
        ),
      Toggle(h, {
        view: (toggle) =>
          toggle
            .root(h.button.attr("aria-label", "Star"))
            .children(
              toggle.icon(h.span.attr("data-variant", "fill").children(Star(h)))
            ),
      })
    ),
})

export { Example }
