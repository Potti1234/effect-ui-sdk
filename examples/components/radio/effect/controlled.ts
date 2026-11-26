import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { createRadioGroupController, RadioGroup } from "@ui-sdk/effect/radio"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const plans = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

const planGroup = createRadioGroupController()

const ChooseTeam = Command.make("ChooseTeam", { args: {} }, () =>
  Effect.sync(() => {
    planGroup.setValue("team")
    return Component.noop
  })
)

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedValueChangePlan: {
    value: Schema.NullOr(Schema.String),
    reason: Schema.String,
  },
  ClickedChooseTeam: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ value: Schema.NullOr(Schema.String) }),
  message: ExampleMessage,
}).make({
  init: () => ({ value: "pro" }),
  update: {
    RequestedValueChangePlan: ($, { value, reason }) =>
      $.evolve({ value }).run(
        log(
          `${plans.find((plan) => plan.value === value)?.label ?? "None"} (${reason})`
        )
      ),
    ClickedChooseTeam: ($) => $.run(ChooseTeam.make({})),
  },
  view: (h, model) =>
    h.div.attr("data-slot", "stack").children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedChooseTeam())
            .children("Choose Team")
        ),
      Field(h, {
        view: (field) =>
          field.root(h.div).children(
            field.label(h.label).children("Plan"),
            RadioGroup(h, {
              props: { value: model.value, controller: planGroup },
              onEmit: (event) =>
                event._tag === "ValueChange"
                  ? ExampleMessage.RequestedValueChangePlan({
                      value: event.value,
                      reason: event.reason ?? "imperative",
                    })
                  : undefined,
              view: (radioGroup) =>
                field.control(radioGroup.group(h.div)).children(
                  plans.map((plan) =>
                    h.label
                      .key(plan.value)
                      .attr("data-slot", "label")
                      .children(
                        radioGroup
                          .radio(h.button, { value: plan.value })
                          .children(
                            radioGroup
                              .in("radio", { value: plan.value })
                              .indicator(h.span)
                          ),
                        radioGroup.input(h.input, { value: plan.value }),
                        plan.label
                      )
                  )
                ),
            })
          ),
      })
    ),
})

export { Example }
