import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import {
  createRatingController,
  Rating,
  ratingItemValues,
} from "@ui-sdk/effect/rating"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

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

const stars = [1, 2, 3, 4, 5]

const rating = createRatingController()

const ExampleMessage = UiSchema.TaggedEnum({
  ChangedRating: { value: Schema.NullOr(Schema.Number), reason: Schema.String },
  ClickedClearRating: {},
})

const ClearRating = Command.make("ClearRating", { args: {} }, () =>
  Effect.sync(() => {
    rating.setValue(null)
    return Component.noop
  })
)

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ value: Schema.NullOr(Schema.Number) }),
  message: ExampleMessage,
}).make({
  init: () => ({ value: 4 }),
  update: {
    ChangedRating: ($, { value, reason }) =>
      $.evolve({ value }).run(log(`value: ${value} (${reason})`)),
    ClickedClearRating: ($) => $.run(ClearRating.make({})),
  },
  view: (h, model) =>
    h.div.children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedClearRating())
            .children("Clear Rating")
        ),
      Rating(h, {
        props: { value: model.value, controller: rating },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? ExampleMessage.ChangedRating({
                value: event.value,
                reason: event.reason ?? "",
              })
            : undefined,
        view: (rating) =>
          rating.root(h.div.attr("aria-label", "Rating")).children(
            stars.map((index) =>
              rating.item(h.span.key(String(index)), { index }).children(
                Star(h),
                ratingItemValues(index).flatMap((score) => [
                  rating.radio(h.button.key(`radio-${score}`), {
                    value: String(score),
                  }),
                  rating.input(h.input.key(`input-${score}`), {
                    value: String(score),
                  }),
                ])
              )
            )
          ),
      })
    ),
})

export { Example }
