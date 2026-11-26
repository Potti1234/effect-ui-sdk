import * as Html from "@effect/ui/html/Html"
import { Label } from "@ui-sdk/effect/label"
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
      view: (updates) =>
        h.div.attr("data-slot", "row").children(
          updates
            .root(h.button.attr("id", "updates"))
            .children(updates.thumb(h.span)),
          updates.input(h.input),
          Label(h, {
            view: (label) =>
              label
                .root(h.label.attr("for", "updates"))
                .children("Email me product updates"),
          })
        ),
    }),
})

export { Example }
