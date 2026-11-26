import * as Html from "@effect/ui/html/Html"
import { Checkbox } from "@ui-sdk/effect/checkbox"
import { Field } from "@ui-sdk/effect/field"
import * as Schema from "effect/Schema"

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
    Checkbox(h, {
      props: { name: "two-factor", defaultChecked: true, readOnly: true },
      view: (checkbox) =>
        Field(h, {
          view: (field) =>
            field
              .root(h.div)
              .children(
                field
                  .control(checkbox.root(h.button))
                  .children(checkbox.indicator(h.span.children(Check(h)))),
                checkbox.input(h.input),
                h.div
                  .attr("data-slot", "stack")
                  .children(
                    field
                      .label(h.label)
                      .children("Require two-factor authentication"),
                    field
                      .description(h.p)
                      .children("Your organization requires this setting.")
                  )
              ),
        }),
    }),
})

export { Example }
