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
    h.div.attr("data-slot", "stack").children(
      Button(h, {
        props: {
          action: async () => {
            await wait(1000)
            throw new Error("Couldn't save")
          },
        },
        view: (button) =>
          button
            .root(h.button)
            .children(
              button.state.pending
                ? "Saving…"
                : button.state.error
                  ? "Try Again"
                  : "Save Changes"
            ),
      })
    ),
})

export { Example }
