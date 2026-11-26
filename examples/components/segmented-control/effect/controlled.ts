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
import { log } from "../../../shared/effect/log"

const items = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]

const range = createSegmentedControlController()

const ExampleMessage = UiSchema.TaggedEnum({
  ChangedRange: { value: Schema.NullOr(Schema.String), reason: Schema.String },
  ClickedShowMonth: {},
})

const ShowMonth = Command.make("ShowMonth", { args: {} }, () =>
  Effect.sync(() => {
    range.setValue("month")
    return Component.noop
  })
)

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ value: Schema.NullOr(Schema.String) }),
  message: ExampleMessage,
}).make({
  init: () => ({ value: "week" }),
  update: {
    ChangedRange: ($, { value, reason }) =>
      $.evolve({ value }).run(log(`value: ${value} (${reason})`)),
    ClickedShowMonth: ($) => $.run(ShowMonth.make({})),
  },
  view: (h, model) =>
    h.div.children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedShowMonth())
            .children("Show Month")
        ),
      SegmentedControl(h, {
        props: { value: model.value, controller: range },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? ExampleMessage.ChangedRange({
                value: event.value,
                reason: event.reason ?? "",
              })
            : undefined,
        view: (control) =>
          control.root(h.div.attr("aria-label", "Range")).children(
            control.indicator(h.span),
            items.flatMap((item) => [
              control
                .item(h.button.key(item.value), { value: item.value })
                .children(item.label),
              control.input(h.input.key(`${item.value}-input`), {
                value: item.value,
              }),
            ])
          ),
      })
    ),
})

export { Example }
