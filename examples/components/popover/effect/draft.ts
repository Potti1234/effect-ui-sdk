import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import * as HtmlCommand from "@effect/ui/html/HtmlCommand"
import { Field } from "@ui-sdk/effect/field"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const Note = Html.ref("Example.note", "textarea")

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedOpenChangeNote: { open: Schema.Boolean },
  RefusedDismissNote: { reason: Schema.String },
  TypedNote: { note: Schema.String },
  ClickedSave: {},
  ClickedKeepEditing: {},
  ClickedDiscard: {},
})

const closed = { open: false, note: "", asking: false }

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({
    open: Schema.Boolean,
    note: Schema.String,
    asking: Schema.Boolean,
  }),
  message: ExampleMessage,
}).make({
  init: () => closed,
  update: {
    RequestedOpenChangeNote: ($, { open }) =>
      open ? $.evolve({ open: true }) : $.set(closed),
    RefusedDismissNote: ($, { reason }) =>
      $.evolve({ asking: true }).run(log(`Kept open (${reason})`)),
    TypedNote: ($, { note }) => $.evolve({ note }),
    ClickedSave: ($) =>
      $.set(closed).run(
        log($.model.note ? "Saved the note" : "Nothing to save")
      ),
    ClickedKeepEditing: ($) =>
      $.evolve({ asking: false }).run(
        HtmlCommand.focus(Note, () => Component.noop)
      ),
    ClickedDiscard: ($) => $.set(closed).run(log("Discarded the note")),
  },
  view: (h, model) =>
    Popover(h, {
      props: { open: model.open, dismissible: model.note === "" },
      onEmit: (event) =>
        event._tag === "OpenChange"
          ? ExampleMessage.RequestedOpenChangeNote({ open: event.value })
          : event._tag === "DismissAttempt"
            ? ExampleMessage.RefusedDismissNote({ reason: event.reason ?? "" })
            : undefined,
      view: (popover) =>
        h.div.children(
          popover.trigger(h.button).children("Add Note"),
          popover.content(
            h.div.children(
              popover.title(h.h2).children("Add a note"),
              popover.description(h.p).children("Only your team can see it."),
              Field(h, {
                key: "note",
                view: (field) =>
                  field.root(h.div).children(
                    field.label(h.label).children("Note"),
                    field.control(
                      h.textarea
                        .ref(Note)
                        .attr(
                          "placeholder",
                          "Call the printer about the proofs."
                        )
                        .value(model.note)
                        .on("input", ({ value }) =>
                          ExampleMessage.TypedNote({ note: value })
                        )
                    )
                  ),
              }),
              model.asking
                ? h.div
                    .key("asking")
                    .attrs({ "data-slot": "row", role: "alert" })
                    .children(
                      "Discard your note?",
                      h.div.attr("data-slot", "row").children(
                        h.button
                          .attrs({ type: "button", "data-size": "sm" })
                          .on("click", ExampleMessage.ClickedKeepEditing())
                          .children("Keep Editing"),
                        h.button
                          .attrs({
                            type: "button",
                            "data-size": "sm",
                            "data-variant": "solid",
                          })
                          .on("click", ExampleMessage.ClickedDiscard())
                          .children("Discard")
                      )
                    )
                : h.div
                    .key("actions")
                    .attr("data-slot", "row")
                    .children(
                      popover.close(h.button).children("Cancel"),
                      h.button
                        .attrs({ type: "button", "data-variant": "solid" })
                        .on("click", ExampleMessage.ClickedSave())
                        .children("Save")
                    )
            )
          )
        ),
    }),
})

export { Example }
