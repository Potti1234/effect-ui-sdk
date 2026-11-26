import * as Html from "@effect/ui/html/Html"
import { Switch } from "@ui-sdk/effect/switch"
import * as Schema from "effect/Schema"

const settings = [
  { label: "Product updates", props: {} },
  { label: "Security alerts", props: { defaultChecked: true, disabled: true } },
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
          props: setting.props,
          view: (parts) =>
            h.label
              .attr("data-slot", "label")
              .children(
                setting.label,
                parts.root(h.button).children(parts.thumb(h.span)),
                parts.input(h.input)
              ),
        })
      )
    ),
})

export { Example }
