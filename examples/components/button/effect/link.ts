import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
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
      Button(h, {
        key: "installation",
        view: (button) =>
          button
            .root(h.a.attr("href", "#installation"))
            .children("Get Started"),
      }),
      Button(h, {
        key: "changelog",
        props: { disabled: true },
        view: (button) =>
          button.root(h.a.attr("href", "#changelog")).children("Changelog"),
      })
    ),
})

export { Example }
