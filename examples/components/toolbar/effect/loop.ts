import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toolbar } from "@ui-sdk/effect/toolbar"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  PressedPage: { label: Schema.String },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    PressedPage: ($, { label }) => $.set(null).run(log(`${label} page`)),
  },
  view: (h) =>
    Toolbar(h, {
      props: { loop: false },
      view: (toolbar) =>
        toolbar
          .root(h.div.attr("aria-label", "Pages"))
          .children(
            ["First", "Previous", "Next", "Last"].map((label) =>
              toolbar
                .button(
                  h.button
                    .key(label)
                    .on("click", ExampleMessage.PressedPage({ label }))
                )
                .children(label)
            )
          ),
    }),
})

export { Example }
