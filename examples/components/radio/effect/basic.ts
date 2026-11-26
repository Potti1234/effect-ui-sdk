import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
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
          field.label(h.label).children("Shipping speed"),
          RadioGroup(h, {
            props: { defaultValue: "standard" },
            view: (radioGroup) =>
              field.control(radioGroup.group(h.div)).children(
                speeds.map((speed) =>
                  h.label
                    .key(speed.value)
                    .attr("data-slot", "label")
                    .children(
                      radioGroup
                        .radio(h.button, { value: speed.value })
                        .children(
                          radioGroup
                            .in("radio", { value: speed.value })
                            .indicator(h.span)
                        ),
                      radioGroup.input(h.input, { value: speed.value }),
                      speed.label
                    )
                )
              ),
          })
        ),
    }),
})

export { Example }
