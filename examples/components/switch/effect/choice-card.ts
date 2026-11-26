import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { Switch } from "@ui-sdk/effect/switch"
import * as Schema from "effect/Schema"

const settings = [
  {
    label: "Public profile",
    description: "Anyone can see your name and photo.",
    defaultChecked: false,
  },
  {
    label: "Show activity status",
    description: "Teammates can see when you're online.",
    defaultChecked: true,
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
    h.div.attr("data-slot", "stack").children(
      settings.map((setting) =>
        Switch(h, {
          key: setting.label,
          props: { defaultChecked: setting.defaultChecked },
          view: (parts) =>
            Field(h, {
              view: (field) =>
                field
                  .root(h.div.attr("data-variant", "card"))
                  .children(
                    h.div
                      .attr("data-slot", "stack")
                      .children(
                        field.label(h.label).children(setting.label),
                        field.description(h.p).children(setting.description)
                      ),
                    field
                      .control(parts.root(h.button))
                      .children(parts.thumb(h.span)),
                    parts.input(h.input)
                  ),
            }),
        })
      )
    ),
})

export { Example }
