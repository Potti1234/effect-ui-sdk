import * as Html from "@effect/ui/html/Html"
import { Separator } from "@ui-sdk/effect/separator"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div
      .attr("data-slot", "stack")
      .children(
        h.dl.children(h.dt.children("Plan"), h.dd.children("Pro")),
        Separator(h, { view: (separator) => separator.root(h.div) }),
        h.dl.children(h.dt.children("Seats"), h.dd.children("8 of 10")),
        Separator(h, { view: (separator) => separator.root(h.div) }),
        h.dl.children(
          h.dt.children("Renews"),
          h.dd.children("December 1, 2026")
        )
      ),
})

export { Example }
