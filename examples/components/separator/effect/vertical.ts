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
    h.nav.attrs({ "aria-label": "Legal", "data-slot": "row" }).children(
      h.a.attr("href", "#").children("Privacy"),
      Separator(h, {
        props: { orientation: "vertical" },
        view: (separator) => separator.root(h.div),
      }),
      h.a.attr("href", "#").children("Terms"),
      Separator(h, {
        props: { orientation: "vertical" },
        view: (separator) => separator.root(h.div),
      }),
      h.a.attr("href", "#").children("Cookies")
    ),
})

export { Example }
