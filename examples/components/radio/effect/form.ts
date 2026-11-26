import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const speeds = [
  { value: "standard", label: "Standard", detail: "Free, 5 to 7 days" },
  { value: "express", label: "Express", detail: "$9, 2 days" },
  { value: "overnight", label: "Overnight", detail: "$24, next day" },
]

const ExampleMessage = UiSchema.TaggedEnum({
  SubmittedForm: {
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    SubmittedForm: ($, { entries }) =>
      $.set(null).run(
        log(
          `Submitted shipping=${entries.find(([name]) => name === "shipping")?.[1] ?? null}`
        )
      ),
  },
  view: (h) =>
    h.div.attr("data-slot", "stack").children(
      Field(h, {
        view: (field) =>
          field.root(h.div).children(
            field.label(h.label).children("Shipping speed"),
            RadioGroup(h, {
              props: {
                name: "shipping",
                form: "shipping-checkout",
                required: true,
                defaultValue: "standard",
              },
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
                        speed.label,
                        h.span
                          .attr("data-slot", "hint")
                          .children(`(${speed.detail})`)
                      )
                  )
                ),
            })
          ),
      }),
      h.form
        .attrs({ "data-slot": "row", id: "shipping-checkout" })
        .on("submit", ({ entries }) =>
          ExampleMessage.SubmittedForm({ entries })
        )
        .children(
          h.button
            .attrs({ type: "submit", "data-variant": "solid" })
            .children("Continue"),
          h.button.attr("type", "reset").children("Reset")
        )
    ),
})

export { Example }
