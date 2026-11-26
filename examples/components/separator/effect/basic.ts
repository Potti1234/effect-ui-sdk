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
        h.div
          .attr("data-slot", "stack")
          .children(
            h.h3.children("Hollis Grant"),
            h.p.attr("data-slot", "hint").children("hollis@example.com")
          ),
        Separator(h, { view: (separator) => separator.root(h.div) }),
        h.p.children(
          "Designs the billing and onboarding flows, and reviews every new pricing page."
        )
      ),
})

export { Example }
