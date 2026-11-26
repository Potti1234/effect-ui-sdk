import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { createParts } from "@ui-sdk/effect/primitive"
import * as Schema from "effect/Schema"
import { rating } from "../rating-stages/state"

const Rating = createParts(rating, { name: "Rating", tags: {} })

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
    Rating(h, {
      onEmit: {
        ValueChange: ({ value }) =>
          ExampleMessage.RequestedValueChangeRating({ value }),
      },
      view: (rating) =>
        h.div.attr("data-slot", "stack").children(
          h.div
            .attr("data-slot", "controls")
            .children(
              rating.calls
                .rate(h.button.attrs({ type: "button", "data-size": "sm" }), 3)
                .children("Set to 3"),
              rating.calls
                .rate(h.button.attrs({ type: "button", "data-size": "sm" }), 0)
                .children("Reset")
            ),
          h.div.attr("data-slot", "rating-readout").children(
            h.output
              .attrs({
                "data-slot": "rating-value",
                "data-value": "",
                "aria-label": "Rating",
              })
              .children(String(model.value)),
            h.span.attr("data-slot", "hint").children("Rating")
          )
        ),
    }),
})

export { Example }
