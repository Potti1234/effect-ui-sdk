import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import { Field } from "@ui-sdk/effect/field"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  ChangedTitle: { title: Schema.String },
  PressedPublish: {},
})

const ready = (title: string) => title.trim() !== ""

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ title: Schema.String }),
  message: ExampleMessage,
}).make({
  init: () => ({ title: "" }),
  update: {
    ChangedTitle: ($, { title }) => $.evolve({ title }),
    PressedPublish: ($) =>
      ready($.model.title)
        ? $.run(log(`Published “${$.model.title}”`))
        : $.model,
  },
  view: (h, model) =>
    h.div.attr("data-slot", "stack").children(
      Field(h, {
        view: (field) =>
          field
            .root(h.div)
            .children(
              field.label(h.label).children("Title"),
              field.control(
                h.input
                  .value(model.title)
                  .on("input", ({ value }) =>
                    ExampleMessage.ChangedTitle({ title: value })
                  )
              )
            ),
      }),
      h.div.attr("data-slot", "row").children(
        Button(h, {
          props: { disabled: !ready(model.title), focusableWhenDisabled: true },
          view: (button) =>
            button
              .root(
                h.button
                  .attr("aria-describedby", "publish-hint")
                  .on("click", ExampleMessage.PressedPublish())
              )
              .children("Publish"),
        }),
        h.p
          .attrs({ id: "publish-hint", "data-slot": "hint" })
          .children(
            ready(model.title) ? "Ready to publish." : "Add a title to publish."
          )
      )
    ),
})

export { Example }
