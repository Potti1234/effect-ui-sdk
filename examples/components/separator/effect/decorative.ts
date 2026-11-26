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
    h.div.attr("data-slot", "stack").children(
      h.button
        .attrs({ type: "button", "data-variant": "solid" })
        .children("Sign In with Passkey"),
      h.div.attr("data-slot", "row").children(
        Separator(h, {
          props: { decorative: true },
          view: (separator) => separator.root(h.div),
        }),
        h.span.children("or"),
        Separator(h, {
          props: { decorative: true },
          view: (separator) => separator.root(h.div),
        })
      ),
      h.button.attr("type", "button").children("Email Me a Link")
    ),
})

export { Example }
