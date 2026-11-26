import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { Switch } from "@ui-sdk/effect/switch"
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
    SubmittedForm: ($, { entries }) =>
      $.set(null).run(
        log(
          `Submitted two-factor=${entries.find(([name]) => name === "two-factor")?.[1] ?? null}`
        )
      ),
  },
  view: (h) =>
    h.form
      .attr("data-slot", "stack")
      .on("submit", ({ entries }) => ExampleMessage.SubmittedForm({ entries }))
      .children(
        Switch(h, {
          props: { name: "two-factor", required: true },
          view: (parts) =>
            Field(h, {
              view: (field) =>
                field.root(h.div).children(
                  h.div
                    .attr("data-slot", "row")
                    .children(
                      h.div
                        .attr("data-slot", "stack")
                        .children(
                          field
                            .label(h.label)
                            .children("Two-factor authentication"),
                          field
                            .description(h.p)
                            .children("Required for admins of this workspace.")
                        ),
                      field
                        .control(parts.root(h.button))
                        .children(parts.thumb(h.span)),
                      parts.input(h.input)
                    ),
                  field.error(h.div.children("Turn this on to continue."), {
                    match: "valueMissing",
                  })
                ),
            }),
        }),
        h.div
          .attr("data-slot", "row")
          .children(
            h.button
              .attrs({ type: "submit", "data-variant": "solid" })
              .children("Continue")
          )
      ),
})

export { Example }
