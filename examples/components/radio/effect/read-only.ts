import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Field(h, {
      view: (field) =>
        field.root(h.div).children(
          field.label(h.label).children("Your plan"),
          field.description(h.p).children("Ask an admin to change plans."),
          RadioGroup(h, {
            props: { defaultValue: "pro", readOnly: true },
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
    }),
})

export { Example }
