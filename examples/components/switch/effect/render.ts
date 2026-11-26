import * as Html from "@effect/ui/html/Html"
import { Switch } from "@ui-sdk/effect/switch"
import * as Schema from "effect/Schema"

const Icon = <M>(h: Html.H<M>) =>
  h.el("svg").attrs({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  })

const Moon = <M>(h: Html.H<M>) =>
  Icon(h).children(
    h
      .el("path")
      .attr(
        "d",
        "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
      )
  )

const Sun = <M>(h: Html.H<M>) =>
  Icon(h).children(
    h.el("circle").attrs({ cx: "12", cy: "12", r: "4" }),
    [
      "M12 2v2",
      "M12 20v2",
      "m4.93 4.93 1.41 1.41",
      "m17.66 17.66 1.41 1.41",
      "M2 12h2",
      "M20 12h2",
      "m6.34 17.66-1.41 1.41",
      "m19.07 4.93-1.41 1.41",
    ].map((d) => h.el("path").attr("d", d))
  )

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Switch(h, {
      view: (parts) =>
        h.label
          .attr("data-slot", "label")
          .children(
            "Dark mode",
            parts
              .root(h.button)
              .children(
                parts
                  .thumb(h.span)
                  .children(parts.thumb.state().checked ? Moon(h) : Sun(h))
              ),
            parts.input(h.input)
          ),
    }),
})

export { Example }
