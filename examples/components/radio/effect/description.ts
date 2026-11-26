import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const frequencies = [
  { value: "instant", label: "Instantly", description: "An email right away." },
  {
    value: "daily",
    label: "Daily digest",
    description: "One email each morning.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "A summary every Monday.",
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
      view: (outerField) =>
        outerField.root(h.div).children(
          outerField.label(h.label).children("Email notifications"),
          RadioGroup(h, {
            props: { defaultValue: "daily" },
            view: (radioGroup) =>
              outerField.control(radioGroup.group(h.div)).children(
                frequencies.map((frequency) =>
                  Field(h, {
                    key: frequency.value,
                    view: (innerField) =>
                      innerField.root(h.div).children(
                        innerField
                          .control(
                            radioGroup.radio(h.button, {
                              value: frequency.value,
                            })
                          )
                          .children(
                            radioGroup
                              .in("radio", { value: frequency.value })
                              .indicator(h.span)
                          ),
                        radioGroup.input(h.input, { value: frequency.value }),
                        h.div
                          .attr("data-slot", "stack")
                          .children(
                            innerField.label(h.label).children(frequency.label),
                            innerField
                              .description(h.p)
                              .children(frequency.description)
                          )
                      ),
                  })
                )
              ),
          })
        ),
    }),
})

export { Example }
