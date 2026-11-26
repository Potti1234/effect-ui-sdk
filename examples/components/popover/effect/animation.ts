import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedOpenChangeNews: { open: Schema.Boolean },
  SettledNews: { open: Schema.Boolean },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    RequestedOpenChangeNews: ($, { open }) =>
      $.run(log(open ? "Opening" : "Closing")),
    SettledNews: ($, { open }) => $.run(log(open ? "Open" : "Closed")),
  },
  view: (h) =>
    Popover(h, {
      onEmit: (event) =>
        event._tag === "OpenChange"
          ? ExampleMessage.RequestedOpenChangeNews({ open: event.value })
          : event._tag === "OpenChangeComplete"
            ? ExampleMessage.SettledNews({ open: event.value })
            : undefined,
      view: (popover) =>
        h.div.children(
          popover.trigger(h.button).children("What's New"),
          popover.content(
            h.div.children(
              popover.title(h.h2).children("What's new"),
              popover
                .description(h.p)
                .children("Comments now support threads and reactions."),
              h.div
                .attr("data-slot", "row")
                .children(
                  popover
                    .close(h.button.attr("data-variant", "solid"))
                    .children("Got It")
                )
            ),
            { keepMounted: true }
          )
        ),
    }),
})

export { Example }
