import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { FieldSet } from "@ui-sdk/effect/field"
import { Switch } from "@ui-sdk/effect/switch"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const notifications = [
  { label: "Product updates", props: { name: "updates" } },
  {
    label: "Security alerts",
    props: { name: "security", defaultChecked: true },
  },
  {
    label: "Weekly digest",
    props: { name: "digest", value: "weekly", defaultChecked: true },
  },
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
          entries.length
            ? `Submitted ${entries.map(([name, value]) => `${name}=${value}`).join("&")}`
            : "Submitted nothing"
        )
      ),
  },
  view: (h) =>
    h.form
      .attr("data-slot", "stack")
      .on("submit", ({ entries }) => ExampleMessage.SubmittedForm({ entries }))
      .children(
        FieldSet(h, {
          view: (fieldSet) =>
            fieldSet.set(h.fieldset).children(
              fieldSet.legend(h.legend).children("Email notifications"),
              notifications.map((notification) =>
                Switch(h, {
                  key: notification.props.name,
                  props: notification.props,
                  view: (parts) =>
                    h.label
                      .attr("data-slot", "label")
                      .children(
                        notification.label,
                        parts.root(h.button).children(parts.thumb(h.span)),
                        parts.input(h.input)
                      ),
                })
              )
            ),
        }),
        h.div
          .attr("data-slot", "row")
          .children(
            h.button
              .attrs({ type: "submit", "data-variant": "solid" })
              .children("Save"),
            h.button.attr("type", "reset").children("Reset")
          )
      ),
})

export { Example }
