import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import {
  createSegmentedControlController,
  SegmentedControl,
} from "@ui-sdk/effect/segmented-control"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import {
  indicatorOptions,
  segmentedControlOptions,
} from "tests/fixtures/page.ts"
import { segmentedControlFixture as f } from "tests/fixtures/segmented-control.ts"
import { mountFixture } from "../../ssr/effect-mount"

const controller = createSegmentedControlController()

const FixtureProps = Schema.Struct({
  defaultValue: Schema.optional(Schema.String),
  disabled: Schema.Boolean,
  cancel: Schema.NullOr(Schema.String),
  orientation: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  followHover: Schema.Boolean,
})

const FixtureMessage = UiSchema.TaggedEnum({
  RequestedValueChange: {
    value: Schema.NullOr(Schema.String),
    reason: Schema.String,
  },
  SubmittedForm: {
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
  ClickedShowCalendar: {},
})

const ShowCalendar = Command.make("ShowCalendar", { args: {} }, () =>
  Effect.sync(() => {
    controller.setValue("calendar")
    return Component.noop
  })
)

const Fixture = Html.component({
  name: "SegmentedControlFixture",
  props: FixtureProps,
  model: Schema.Struct({
    value: Schema.NullOr(Schema.String),
    action: Schema.String,
    submitted: Schema.String,
  }),
  message: FixtureMessage,
}).make({
  init: ($) => ({
    value: $.props.defaultValue ?? null,
    action: "",
    submitted: "",
  }),
  update: {
    RequestedValueChange: ($, { value, reason }) =>
      value === $.props.cancel
        ? $.model
        : $.evolve({ value, action: `${value}:${reason}` }),
    SubmittedForm: ($, { entries }) =>
      $.evolve({
        submitted: entries.map(([key, value]) => `${key}=${value}`).join("&"),
      }),
    ClickedShowCalendar: ($) => $.run(ShowCalendar.make({})),
  },
  view: (h, model) => {
    const { cancel, followHover, ...options } = h.props
    return h.form
      .class("fixture")
      .on("submit", ({ entries }) => FixtureMessage.SubmittedForm({ entries }))
      .children(
        h.button.attr("type", "button").children("Before"),
        SegmentedControl(h, {
          props: {
            name: f.name,
            controller,
            ...options,
            ...(cancel === null ? {} : { value: model.value }),
          },
          onEmit: (event) =>
            event._tag === "ValueChange"
              ? FixtureMessage.RequestedValueChange({
                  value: event.value as string | null,
                  reason: event.reason ?? "",
                })
              : undefined,
          view: (control) =>
            control.root(h.div.attr("aria-label", f.label)).children(
              control.indicator(h.span, { followHover }),
              f.items.flatMap((item) => [
                control
                  .item(h.button.key(`item-${item.value}`), {
                    value: item.value,
                    disabled: item.disabled,
                  })
                  .children(item.label),
                control.input(h.input.key(`input-${item.value}`), {
                  value: item.value,
                  disabled: item.disabled,
                }),
              ])
            ),
        }),
        h.button.key("after").attr("type", "button").children("After"),
        h.button.key("save").attr("type", "submit").children("Save"),
        h.button.key("reset").attr("type", "reset").children("Reset"),
        h.button
          .key("show")
          .attr("type", "button")
          .on("click", FixtureMessage.ClickedShowCalendar())
          .children("Show calendar"),
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

const props = () => {
  const { defaultValue, orientation, ...options } = segmentedControlOptions()
  return {
    ...options,
    ...(defaultValue === undefined ? {} : { defaultValue }),
    ...(orientation ? { orientation } : {}),
    ...indicatorOptions(),
  }
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
