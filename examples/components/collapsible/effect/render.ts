import * as Html from "@effect/ui/html/Html"
import { Collapsible } from "@ui-sdk/effect/collapsible"
import * as Schema from "effect/Schema"

const updates = [
  { label: "Out for delivery", time: "07:40" },
  { label: "Arrived at the local depot", time: "05:12" },
  { label: "Left the sorting center", time: "Wed 21:03" },
]

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
            h.h3.children(
              collapsible
                .trigger(h.button)
                .children(
                  h.span
                    .attr("data-slot", "stack")
                    .children(
                      h.span.children("Track parcel"),
                      h.span
                        .attr("data-slot", "hint")
                        .children(
                          collapsible.state.open
                            ? "3 updates"
                            : "Arrives Thursday"
                        )
                    ),
                  Chevron(h)
                )
            ),
            collapsible.panel(
              h.ol.children(
                updates.map((update) =>
                  h.li
                    .attr("data-slot", "row")
                    .children(
                      h.span.children(update.label),
                      h.span.children(update.time)
                    )
                )
              )
            )
          ),
    }),
})

export { Example }
