import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const channels = [
  { value: "email", label: "Email only" },
  { value: "sms", label: "SMS only" },
  { value: "both", label: "Email and SMS" },
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
          `Saved updates=${entries.find(([name]) => name === "updates")?.[1] ?? null}`
        )
      ),
  },
  view: (h) =>
    h.form
      .attr("data-slot", "stack")
      .on("submit", ({ entries }) => ExampleMessage.SubmittedForm({ entries }))
      .children(
        Field(h, {
          view: (field) =>
            field.root(h.div).children(
              field.label(h.label).children("Order updates"),
              field
                .description(h.p)
                .children("Choose how we tell you about your orders."),
              RadioGroup(h, {
                props: { name: "updates", required: true },
                view: (radioGroup) =>
                  field.control(radioGroup.group(h.div)).children(
                    channels.map((channel) =>
                      h.label
                        .key(channel.value)
                        .attr("data-slot", "label")
                        .children(
                          radioGroup
                            .radio(h.button, { value: channel.value })
                            .children(
                              radioGroup
                                .in("radio", { value: channel.value })
                                .indicator(h.span)
                            ),
                          radioGroup.input(h.input, { value: channel.value }),
                          channel.label
                        )
                    )
                  ),
              }),
              field.error(h.div.children("Choose how to get order updates."))
            ),
        }),
        h.div
          .attr("data-slot", "row")
          .children(
            h.button
              .attrs({ type: "submit", "data-variant": "solid" })
              .children("Save")
          )
      ),
})

export { Example }
