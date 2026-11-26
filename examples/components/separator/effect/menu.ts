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
    h.div.attr("data-slot", "row").children(
      h.div
        .attr("data-slot", "stack")
        .children(
          h.span.children("24"),
          h.span.attr("data-slot", "hint").children("Projects")
        ),
      Separator(h, {
        props: { orientation: "vertical" },
        view: (separator) => separator.root(h.div),
      }),
      h.div
        .attr("data-slot", "stack")
        .children(
          h.span.children("1,280"),
          h.span.attr("data-slot", "hint").children("Followers")
        ),
      Separator(h, {
        props: { orientation: "vertical" },
        view: (separator) => separator.root(h.div),
      }),
      h.div
        .attr("data-slot", "stack")
        .children(
          h.span.children("312"),
          h.span.attr("data-slot", "hint").children("Following")
        )
    ),
})

export { Example }
