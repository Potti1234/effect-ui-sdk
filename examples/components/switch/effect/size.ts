import * as Html from "@effect/ui/html/Html"
import { Switch } from "@ui-sdk/effect/switch"
import * as Schema from "effect/Schema"

const sizes = [
  { label: "Small", size: "sm" },
  { label: "Default", size: undefined },
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
      sizes.map((size) =>
        Switch(h, {
          key: size.label,
          view: (parts) =>
            h.label
              .attr("data-slot", "label")
              .children(
                size.label,
                parts
                  .root(h.button.attr("data-size", size.size))
                  .children(parts.thumb(h.span)),
                parts.input(h.input)
              ),
        })
      )
    ),
})

export { Example }
