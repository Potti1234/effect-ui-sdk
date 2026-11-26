import * as Html from "@effect/ui/html/Html"
import { Label } from "@ui-sdk/effect/label"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
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
      Label(h, {
        view: (label) =>
          label
            .root(h.label.attr("for", "shipping-speed"))
            .children("Shipping speed"),
      }),
      RadioGroup(h, {
        props: { defaultValue: "standard" },
        view: (group) =>
          group.group(h.div.attr("id", "shipping-speed")).children(
            speeds.map((speed) => {
              const radio = group.in("radio", { value: speed.value })
              return Label(h, {
                key: speed.value,
                view: (label) =>
                  label
                    .root(h.label)
                    .children(
                      group
                        .radio(h.button, { value: speed.value })
                        .children(radio.indicator(h.span)),
                      group.input(h.input, { value: speed.value }),
                      speed.label
                    ),
              })
            })
          ),
      })
    ),
})

export { Example }
