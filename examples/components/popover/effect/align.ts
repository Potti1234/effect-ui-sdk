import * as Html from "@effect/ui/html/Html"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"

const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
] as const

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("data-slot", "row").children(
      aligns.map((align) =>
        Popover(h, {
          key: align.value,
          view: (popover) =>
            h.div.children(
              popover.trigger(h.button).children(align.label),
              popover.content(
                h.div.children(
                  popover.title(h.h2).children("Delivery window"),
                  popover
                    .description(h.p)
                    .children("Arrives Tuesday between 9 AM and noon.")
                ),
                { align: align.value, sideOffset: 8 }
              )
            ),
        })
      )
    ),
})

export { Example }
