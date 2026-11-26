import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import { Field } from "@ui-sdk/effect/field"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

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
    SubmittedForm: ($, { entries }) => {
      const email = entries.find(([name]) => name === "email")?.[1] ?? ""
      return $.set(null).run(log(`Subscribed ${email}`))
    },
  },
  view: (h) =>
    h.form
      .attr("data-slot", "stack")
      .on("submit", ({ entries }) => ExampleMessage.SubmittedForm({ entries }))
      .children(
        Field(h, {
          view: (field) =>
            field.root(h.div).children(
              field.label(h.label).children("Email"),
              field.control(
                h.input.attrs({
                  name: "email",
                  type: "email",
                  value: "ada@example.com",
                })
              )
            ),
        }),
        h.div.attr("data-slot", "row").children(
          Button(h, {
            key: "submit",
            props: { type: "submit" },
            view: (button) => button.root(h.button).children("Subscribe"),
          }),
          Button(h, {
            key: "reset",
            props: { type: "reset" },
            view: (button) => button.root(h.button).children("Reset"),
          })
        )
      ),
})

export { Example }
