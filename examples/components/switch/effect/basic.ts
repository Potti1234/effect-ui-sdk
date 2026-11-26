import * as Html from "@effect/ui/html/Html"
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
      view: (parts) =>
        h.label
          .attr("data-slot", "label")
          .children(
            "Airplane mode",
            parts.root(h.button).children(parts.thumb(h.span)),
            parts.input(h.input)
          ),
    }),
})

export { Example }
