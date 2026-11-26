import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Checkbox, CheckboxGroup } from "@ui-sdk/effect/checkbox"
import { Field } from "@ui-sdk/effect/field"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const channels = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push notifications" },
]

const ExampleMessage = UiSchema.TaggedEnum({
  SubmittedForm: {
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
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
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    SubmittedForm: ($, { entries }) =>
      $.set(null).run(
        log(
          `Saved ${entries.map(([name, value]) => `${name}=${value}`).join("&")}`
        )
      ),
  },
  view: (h) =>
    h.form
      .attr("data-slot", "stack")
      .on("submit", ({ entries }) => ExampleMessage.SubmittedForm({ entries }))
      .children(
        CheckboxGroup(h, {
          props: { name: "notifications", required: true },
          view: (group) =>
            Field(h, {
              view: (field) =>
                field.root(h.div).children(
                  field.label(h.label).children("Notifications"),
                  field
                    .description(h.p)
                    .children("Choose how we tell you about your orders."),
                  field.control(group.group(h.div)).children(
                    channels.map((channel) =>
                      Checkbox(h, {
                        key: channel.value,
                        props: { value: channel.value, group: group.join },
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
                              channel.label
                            ),
                      })
                    )
                  ),
                  group.input(h.input),
                  h.div.children(
                    field.error(
                      h.p.children("Choose at least one way to be notified.")
                    )
                  )
                ),
            }),
        }),
        h.button.attr("type", "submit").children("Save")
      ),
})

export { Example }
