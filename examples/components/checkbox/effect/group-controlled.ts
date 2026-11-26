import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import {
  Checkbox,
  CheckboxGroup,
  createCheckboxGroupController,
} from "@ui-sdk/effect/checkbox"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const days = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
]

const weekdays = ["mon", "tue", "wed", "thu", "fri"]

const schedule = createCheckboxGroupController()

const SetSchedule = Command.make(
  "SetSchedule",
  { args: { value: Schema.Array(Schema.String) } },
  ({ value }) =>
    Effect.sync(() => {
      schedule.setValue([...value])
      return Component.noop
    })
)

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedValueChangeDays: {
    value: Schema.Array(Schema.String),
    reason: Schema.String,
  },
  ClickedSelectWeekdays: {},
  ClickedClear: {},
})

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
  model: Schema.Struct({ value: Schema.Array(Schema.String) }),
  message: ExampleMessage,
}).make({
  init: () => ({ value: ["mon", "tue"] }),
  update: {
    RequestedValueChangeDays: ($, { value, reason }) => {
      const names = days
        .filter((day) => value.includes(day.value))
        .map((day) => day.label)
      return $.evolve({ value }).run(
        log(`${names.join(", ") || "No days"} (${reason})`)
      )
    },
    ClickedSelectWeekdays: ($) => $.run(SetSchedule.make({ value: weekdays })),
    ClickedClear: ($) => $.run(SetSchedule.make({ value: [] })),
  },
  view: (h, model) =>
    CheckboxGroup(h, {
      props: { value: model.value, controller: schedule },
      onEmit: (event) =>
        event._tag === "ValueChange"
          ? ExampleMessage.RequestedValueChangeDays({
              value: event.value,
              reason: event.reason ?? "imperative",
            })
          : undefined,
      view: (group) =>
        h.div.attr("data-slot", "stack").children(
          h.div
            .attr("data-slot", "controls")
            .children(
              h.button
                .attr("type", "button")
                .on("click", ExampleMessage.ClickedSelectWeekdays())
                .children("Select Weekdays"),
              h.button
                .attr("type", "button")
                .on("click", ExampleMessage.ClickedClear())
                .children("Clear")
            ),
          h.h3.attr("id", "controlled-days").children("Working days"),
          group
            .group(h.div.attr("aria-labelledby", "controlled-days"))
            .children(
              days.map((day) =>
                Checkbox(h, {
                  key: day.value,
                  props: { value: day.value, group: group.join },
                  view: (checkbox) =>
                    h.label
                      .attr("data-slot", "label")
                      .children(
                        checkbox
                          .root(h.button)
                          .children(
                            checkbox.indicator(h.span.children(Check(h)))
                          ),
                        checkbox.input(h.input),
                        day.label
                      ),
                })
              )
            ),
          group.input(h.input)
        ),
    }),
})

export { Example }
