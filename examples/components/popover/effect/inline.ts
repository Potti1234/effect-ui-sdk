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
    h.div.attr("data-slot", "popover-frame").children(
      Popover(h, {
        view: (popover) =>
          h.div
            .attr("data-slot", "popover-corner")
            .children(
              popover.trigger(h.button).children("Feedback"),
              popover.content(
                h.div.children(
                  popover.title(h.h2).children("Send feedback"),
                  popover
                    .description(h.p)
                    .children(
                      "The panel sits in the corner box, above its trigger."
                    ),
                  h.div
                    .attr("data-slot", "row")
                    .children(popover.close(h.button).children("Close"))
                ),
                { inline: true }
              )
            ),
      })
    ),
})

export { Example }
