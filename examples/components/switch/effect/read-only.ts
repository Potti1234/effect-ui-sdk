import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { Switch } from "@ui-sdk/effect/switch"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Switch(h, {
      props: { name: "encrypt", defaultChecked: true, readOnly: true },
      view: (parts) =>
        Field(h, {
          view: (field) =>
            field
              .root(h.div)
              .children(
                h.div
                  .attr("data-slot", "stack")
                  .children(
                    field.label(h.label).children("Encrypt backups"),
                    field
                      .description(h.p)
                      .children("Your organization manages this setting.")
                  ),
                field
                  .control(parts.root(h.button))
                  .children(parts.thumb(h.span)),
                parts.input(h.input)
              ),
        }),
    }),
})

export { Example }
