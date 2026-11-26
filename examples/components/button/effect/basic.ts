import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  PressedButton: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    PressedButton: ($) => $.set(null).run(log("Pressed")),
  },
  view: (h) =>
    Button(h, {
      view: (button) =>
        button
          .root(h.button.on("click", ExampleMessage.PressedButton()))
          .children("Button"),
    }),
})

export { Example }
