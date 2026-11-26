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
import { ratingOptions } from "tests/fixtures/page.ts"
import { ratingFixture } from "tests/fixtures/rating.ts"
import { mountFixture } from "../../ssr/effect-mount"

const { quality, value, average } = ratingFixture
const controller = createRatingController()

const FixtureProps = Schema.Struct({
  disabled: Schema.Boolean,
  cancel: Schema.NullOr(Schema.Number),
})

const FixtureMessage = UiSchema.TaggedEnum({
  RequestedValueChange: {
    score: Schema.NullOr(Schema.Number),
    reason: Schema.String,
  },
  SubmittedForm: {
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
  ClickedRateFive: {},
})

const RateFive = Command.make("RateFive", { args: {} }, () =>
  Effect.sync(() => {
    controller.setValue(5)
    return Component.noop
  })
)

type RatingParts = Parameters<
  NonNullable<Parameters<typeof Rating>[1]["view"]>
>[0]

const Fixture = Html.component({
  name: "RatingFixture",
  props: FixtureProps,
  model: Schema.Struct({
    score: Schema.NullOr(Schema.Number),
    action: Schema.String,
    submitted: Schema.String,
  }),
  message: FixtureMessage,
}).make({
  init: () => ({ score: quality.defaultValue, action: "", submitted: "" }),
  update: {
    RequestedValueChange: ($, { score, reason }) =>
      score === $.props.cancel
        ? $.model
        : $.evolve({ score, action: `${score}:${reason}` }),
    SubmittedForm: ($, { entries }) =>
      $.evolve({
        submitted: entries.map(([key, entry]) => `${key}=${entry}`).join("&"),
      }),
    ClickedRateFive: ($) => $.run(RateFive.make({})),
  },
  view: (h, model) => {
    // Every star, with its radios, and what it shows inside.
    const stars = (
      rating: RatingParts,
      max: number,
      step: number,
      content?: (fill: number) => string
    ) =>
      Array.from({ length: max }, (_, at) => {
        const index = at + 1
        return rating.item(h.span.key(`star-${index}`), { index }).children(
          content &&
            h.span
              .class("star")
              .children(content(rating.item.state({ index }).fill)),
          ratingItemValues(index, step).flatMap((score) => [
            rating.radio(h.button.key(`radio-${score}`), {
              value: String(score),
            }),
            rating.input(h.input.key(`input-${score}`), {
              value: String(score),
            }),
          ])
        )
      })
    const { cancel, disabled } = h.props
    return h.form
      .class("fixture")
      .on("submit", ({ entries }) => FixtureMessage.SubmittedForm({ entries }))
      .children(
        h.button.attr("type", "button").children("Before"),
        Rating(h, {
          key: "quality",
          props: {
            name: quality.name,
            disabled,
            controller,
            ...(cancel === null
              ? { defaultValue: quality.defaultValue }
              : { value: model.score }),
          },
          onEmit: (event) =>
            event._tag === "ValueChange"
              ? FixtureMessage.RequestedValueChange({
                  score: event.value,
                  reason: event.reason ?? "",
                })
              : undefined,
          view: (rating) =>
            rating
              .root(h.div.attr("aria-label", quality.label))
              .children(stars(rating, 5, 1, String)),
        }),
        h.button.key("after").attr("type", "button").children("After"),
        Rating(h, {
          key: "value",
          props: { name: value.name, step: value.step, deselectable: true },
          view: (rating) =>
            rating
              .root(h.div.attr("aria-label", value.label))
              .children(stars(rating, 5, value.step)),
        }),
        Rating(h, {
          key: "average",
          props: {
            value: average.value,
            getValueLabel: average.getValueLabel,
            readOnly: true,
          },
          view: (rating) => rating.root(h.div).children(stars(rating, 5, 1)),
        }),
        h.button.key("save").attr("type", "submit").children("Save"),
        h.button.key("reset").attr("type", "reset").children("Reset"),
        h.button
          .key("rate")
          .attr("type", "button")
          .on("click", FixtureMessage.ClickedRateFive())
          .children("Rate five"),
        h.output
          .key("action")
          .attrs({ role: "status", "aria-label": "Last action" })
          .children(model.action),
        h.output
          .key("submitted")
          .attr("aria-label", "Submitted")
          .children(model.submitted)
      )
  },
})

const props = () => ratingOptions()

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
