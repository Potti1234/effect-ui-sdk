import * as Html from "@effect/ui/html/Html"
import { Toggle } from "@ui-sdk/effect/toggle"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Toggle(h, {
      view: (toggle) =>
        toggle
          .root(h.button.attr("data-variant", "outline"))
          .children("Bookmark"),
    }),
})

export { Example }
