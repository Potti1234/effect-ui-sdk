import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  ClickedFollow: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    ClickedFollow: ($) => $.run(log("Followed @kofi")),
  },
  view: (h) =>
    Popover(h, {
      props: { openOnHover: true, delay: 200, closeDelay: 150 },
      view: (popover) =>
        h.div.children(
          popover.trigger(h.button).children("@kofi"),
          popover.content(
            h.div.children(
              popover.arrow(h.div),
              popover.title(h.h2).children("Kofi Mensah"),
              popover
                .description(h.p)
                .children("Engineering manager, platform team."),
              h.div.attr("data-slot", "row").children(
                h.button
                  .attrs({
                    type: "button",
                    "data-size": "sm",
                    "data-variant": "solid",
                  })
                  .on("click", ExampleMessage.ClickedFollow())
                  .children("Follow")
              )
            ),
            { sideOffset: 8 }
          )
        ),
    }),
})

export { Example }
