import * as Command from "@effect/ui/Command"
import * as Renderer from "@effect/ui/Renderer"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { createPopoverController, Popover } from "@ui-sdk/effect/popover"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const Member = Schema.Struct({ name: Schema.String, role: Schema.String })
type Member = typeof Member.Type

const roles = ["Admin", "Editor", "Viewer"]

const popover = createPopoverController<Member>()

const EditNewest = Html.ref("Example.editNewest", "button")

const ExampleMessage = UiSchema.TaggedEnum({
  ClickedEditNewest: {},
  ClosedEditor: { reason: Schema.String, returnValue: Schema.String },
  ChangedPayload: { name: Schema.String },
  SubmittedRole: {
    name: Schema.String,
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
})

const OpenEditor = Command.make(
  "OpenEditor",
  { args: { member: Member } },
  ({ member }) =>
    Renderer.Refs.use((refs) => refs.lookup(EditNewest)).pipe(
      Effect.flatMap((anchor) =>
        Effect.promise(() =>
          popover.open({
            payload: member,
            anchor: Option.getOrUndefined(anchor),
          })
        )
      ),
      Effect.map((result) =>
        ExampleMessage.ClosedEditor({
          reason: result.reason,
          returnValue: result.returnValue ?? "nothing",
        })
      )
    )
)

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ members: Schema.Array(Member) }),
  message: ExampleMessage,
}).make({
  init: () => ({
    members: [
      { name: "Hollis Grant", role: "Owner" },
      { name: "Inès Moreau", role: "Editor" },
      { name: "Kofi Mensah", role: "Viewer" },
      { name: "Wren Takahashi", role: "Viewer" },
    ],
  }),
  update: {
    ClickedEditNewest: ($) =>
      $.run(OpenEditor.make({ member: $.model.members.at(-1)! })),
    ClosedEditor: ($, { reason, returnValue }) =>
      $.run(log(`Closed (${reason}), returned ${returnValue}`)),
    ChangedPayload: ($, { name }) => $.run(log(`Editing ${name}`)),
    SubmittedRole: ($, { name, entries }) => {
      const fields = new Map(entries)
      const role = fields.get("role")
      return fields.get("action") === "save" && role !== undefined
        ? $.evolve({
            members: (members) =>
              members.map((entry) =>
                entry.name === name ? { ...entry, role } : entry
              ),
          })
        : $.model
    },
  },
  view: (h, model) =>
    Popover(h, {
      props: { controller: popover },
      onEmit: (event) => {
        const member = event._tag === "PayloadChange" && (event.value as Member)
        return member
          ? ExampleMessage.ChangedPayload({ name: member.name })
          : undefined
      },
      view: (editor) => {
        const member = editor.content.state().payload as Member | undefined
        return h.div.attr("data-slot", "stack").children(
          h.div
            .attr("data-slot", "controls")
            .children(
              h.button
                .ref(EditNewest)
                .attr("type", "button")
                .on("click", ExampleMessage.ClickedEditNewest())
                .children("Edit Newest Member")
            ),
          h.ul.attr("data-slot", "list").children(
            model.members.map((entry) =>
              h.li
                .key(entry.name)
                .attr("data-slot", "row")
                .children(
                  entry.name,
                  h.span.attr("data-slot", "hint").children(entry.role),
                  editor
                    .trigger(
                      h.button.attrs({
                        "data-size": "sm",
                        "data-variant": "ghost",
                        "aria-label": `Edit ${entry.name}`,
                      }),
                      { payload: entry, disabled: entry.role === "Owner" }
                    )
                    .children("Edit")
                )
            )
          ),
          editor.content(
            h.div.children(
              editor.title(h.h2).children(member?.name ?? ""),
              editor
                .description(h.p)
                .children("Roles decide what they can change."),
              h.form
                .attrs({ "data-slot": "stack", method: "dialog" })
                .on("submit", ({ entries }) =>
                  ExampleMessage.SubmittedRole({
                    name: member?.name ?? "",
                    entries,
                  })
                )
                .children(
                  Field(h, {
                    key: "role",
                    view: (field) =>
                      field.root(h.div).children(
                        field.label(h.label).children("Role"),
                        member &&
                          field.control(
                            h.select
                              .key(member.name)
                              .attr("name", "role")
                              .children(
                                roles.map((role) =>
                                  h.option
                                    .attr(
                                      "selected",
                                      role === member.role ? "" : undefined
                                    )
                                    .children(role)
                                )
                              )
                          )
                      ),
                  }),
                  h.div.attr("data-slot", "row").children(
                    h.button
                      .attrs({
                        type: "submit",
                        name: "action",
                        value: "cancel",
                        formnovalidate: "",
                      })
                      .children("Cancel"),
                    h.button
                      .attrs({
                        type: "submit",
                        name: "action",
                        value: "save",
                        "data-variant": "solid",
                      })
                      .children("Save")
                  )
                )
            ),
            { align: "end", sideOffset: 8 }
          )
        )
      },
    }),
})

export { Example }
