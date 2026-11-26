import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Collapsible } from "@ui-sdk/effect/collapsible"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const notes = [
  "Search now matches file contents, not only names.",
  "Shared links remember the folder they were opened from.",
  "Uploads resume after the connection drops.",
]

const ExampleMessage = UiSchema.TaggedEnum({
  SettledNotes: { open: Schema.Boolean },
})

const Chevron = <M>(h: Html.H<M>) =>
  h
    .el("svg")
    .attrs({
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    })
    .children(h.el("path").attr("d", "m6 9 6 6 6-6"))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    SettledNotes: ($, { open }) =>
      $.set(null).run(log(open ? "Finished opening" : "Finished closing")),
  },
  view: (h) =>
    Collapsible(h, {
      onEmit: (event) =>
        event._tag === "OpenChangeComplete"
          ? ExampleMessage.SettledNotes({ open: event.value })
          : undefined,
      view: (collapsible) =>
        collapsible
          .root(h.div.attr("data-variant", "card"))
          .children(
            collapsible
              .trigger(h.button)
              .children(
                h.span
                  .attr("data-slot", "stack")
                  .children(
                    h.span.children("Release notes"),
                    h.span
                      .attr("data-slot", "hint")
                      .children("Version 2.4, released October 28")
                  ),
                Chevron(h)
              ),
            collapsible.panel(
              h.div.children(
                h.ul.children(notes.map((note) => h.li.children(note)))
              )
            )
          ),
    }),
})

export { Example }
