import * as Html from "@effect/ui/html/Html"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Popover(h, {
      view: (popover) =>
        h.div
          .attr("dir", "rtl")
          .children(
            popover.trigger(h.button).children("الأبعاد"),
            popover.content(
              h.div.children(
                popover.arrow(h.div),
                popover.title(h.h2).children("الأبعاد"),
                popover.description(h.p).children("اضبط أبعاد الطبقة.")
              ),
              { align: "start", sideOffset: 8 }
            )
          ),
    }),
})

export { Example }
