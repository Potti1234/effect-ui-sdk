import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toolbar } from "@ui-sdk/effect/toolbar"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  PressedReply: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    PressedReply: ($) => $.set(null).run(log("Reply")),
  },
  view: (h) =>
    Toolbar(h, {
      view: (toolbar) =>
        toolbar.root(h.div.attr("aria-label", "Message")).children(
          toolbar
            .button(h.button.on("click", ExampleMessage.PressedReply()))
            .children("Reply"),
          toolbar.button(h.button, { disabled: true }).children("Archive"),
          toolbar
            .button(h.button, {
              disabled: true,
              focusableWhenDisabled: false,
            })
            .children("Delete")
        ),
    }),
})

export { Example }
