import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import * as Schema from "effect/Schema"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Button(h, {
      props: { action: () => wait(1500), pendingAnnouncement: "Saving" },
      view: (button) => button.root(h.button).children("Save"),
    }),
})

export { Example }
