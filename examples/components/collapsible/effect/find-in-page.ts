import * as Html from "@effect/ui/html/Html"
import { Collapsible } from "@ui-sdk/effect/collapsible"
import * as Schema from "effect/Schema"

const Chevron = <M>(h: Html.H<M>) =>
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
    .children(h.el("path").attr("d", "m6 9 6 6 6-6"))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Collapsible(h, {
      view: (collapsible) =>
        collapsible
          .root(h.div.attr("data-variant", "card"))
          .children(
            collapsible
              .trigger(h.button)
              .children(
                h.span
                  .attr("data-slot", "stack")
                  .children(
                    h.span.children("Ingredients"),
                    h.span
                      .attr("data-slot", "hint")
                      .children("Morning buns, makes 12")
                  ),
                Chevron(h)
              ),
            collapsible.panel(
              h.div.children(
                h.p.children(
                  "Flour, butter, brown sugar, eggs, a pinch of cardamom and sea salt."
                )
              ),
              { hiddenUntilFound: true }
            )
          ),
    }),
})

export { Example }
