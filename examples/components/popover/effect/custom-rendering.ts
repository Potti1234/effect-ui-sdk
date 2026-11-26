import * as Html from "@effect/ui/html/Html"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"

const shortcut = "mod+u"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Popover(h, {
      view: (popover) => {
        const trigger = popover.trigger.state({ shortcut })
        return h.div.children(
          popover
            .trigger(h.button, { shortcut })
            .children(
              trigger.open ? "Hide Updates" : "Show Updates",
              popover.shortcut(h.kbd, { shortcut })
            ),
          popover.content(
            h.div.children(
              popover.title(h.h3).children("Updates"),
              popover
                .description(h.p)
                .children("Version 2.4 adds threaded comments."),
              popover
                .close(h.a.attr("href", "#"))
                .children("Read the Changelog")
            )
          )
        )
      },
    }),
})

export { Example }
