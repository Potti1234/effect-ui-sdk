import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const plans = [
  {
    value: "hobby",
    label: "Hobby",
    description: "Free for personal projects.",
  },
  {
    value: "pro",
    label: "Pro",
    description: "$20 per month for growing teams.",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom pricing and support.",
  },
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
          field.label(h.label).children("Plan"),
          RadioGroup(h, {
            props: { defaultValue: "hobby" },
            view: (radioGroup) =>
              field.control(radioGroup.group(h.div)).children(
                plans.map((plan) =>
                  h.label
                    .key(plan.value)
                    .attr("data-slot", "card")
                    .children(
                      h.span
                        .attr("data-slot", "stack")
                        .children(
                          h.span.children(plan.label),
                          h.span
                            .attr("data-slot", "hint")
                            .children(plan.description)
                        ),
                      radioGroup
                        .radio(h.button, { value: plan.value })
                        .children(
                          radioGroup
                            .in("radio", { value: plan.value })
                            .indicator(h.span)
                        ),
                      radioGroup.input(h.input, { value: plan.value })
                    )
                )
              ),
          })
        ),
    }),
})

export { Example }
