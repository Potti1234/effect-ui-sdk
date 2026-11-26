import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import * as Schema from "effect/Schema"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const svg = <M>(h: Html.H<M>) =>
  h.el("svg").attrs({
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  })

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Button(h, {
      props: { action: () => wait(1500), pendingAnnouncement: "Saving" },
      view: (button) =>
        button
          .root(h.button)
          .children(
            svg(h)
              .attr("data-show", "idle")
              .children(
                h.el("path").attr("d", "M12 17V3"),
                h.el("path").attr("d", "m6 11 6 6 6-6"),
                h.el("path").attr("d", "M19 21H5")
              ),
            svg(h)
              .attrs({ "data-show": "pending", "data-slot": "spinner" })
              .children(h.el("path").attr("d", "M21 12a9 9 0 1 1-6.219-8.56")),
            "Save"
          ),
    }),
})

export { Example }
