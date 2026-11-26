import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { createParts } from "@ui-sdk/effect/primitive"
import * as Schema from "effect/Schema"
import { rating } from "../rating-stages/focus"

const Rating = createParts(rating, {
  name: "Rating",
  tags: { root: "div", star: "button" },
})

const StarIcon = <M>(h: Html.H<M>) =>
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

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedValueChangeRating: { value: Schema.Number },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ value: Schema.Number }),
  message: ExampleMessage,
}).make({
  init: () => ({ value: 0 }),
  update: {
    RequestedValueChangeRating: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) =>
    h.div.attr("data-slot", "stack").children(
      h.div.attr("data-slot", "rating-readout").children(
        h.output
          .attrs({
            "data-slot": "rating-value",
            "data-value": "",
            "aria-label": "Rating out of 5",
          })
          .children(String(model.value)),
        h.span.attr("data-slot", "hint").children("out of 5")
      ),
      Rating(h, {
        onEmit: {
          ValueChange: ({ value }) =>
            ExampleMessage.RequestedValueChangeRating({ value }),
        },
        view: (stars) =>
          stars
            .root(h.div.attr("aria-label", "Rating"))
            .children(
              ["1", "2", "3", "4", "5"].map((value, index) =>
                stars
                  .star(
                    h.button
                      .key(value)
                      .attr(
                        "aria-label",
                        `${value} ${index === 0 ? "star" : "stars"}`
                      ),
                    { value }
                  )
                  .children(StarIcon(h))
              )
            ),
      })
    ),
})

export { Example }
