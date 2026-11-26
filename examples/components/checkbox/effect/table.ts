import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Checkbox, CheckboxGroup } from "@ui-sdk/effect/checkbox"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const people = [
  {
    id: "hollis",
    name: "Hollis Grant",
    email: "hollis@example.com",
    role: "Owner",
  },
  {
    id: "ines",
    name: "Inès Moreau",
    email: "ines@example.com",
    role: "Editor",
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    email: "kofi@example.com",
    role: "Viewer",
  },
  {
    id: "wren",
    name: "Wren Takahashi",
    email: "wren@example.com",
    role: "Editor",
  },
]

const ExampleMessage = UiSchema.TaggedEnum({
  ChangedSelection: { value: Schema.Array(Schema.String) },
})

const Icon = <M>(h: Html.H<M>, d: string) =>
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
    .children(h.el("path").attr("d", d))

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ selected: Schema.Array(Schema.String) }),
  message: ExampleMessage,
}).make({
  init: () => ({ selected: ["hollis"] }),
  update: {
    ChangedSelection: ($, { value }) =>
      $.evolve({ selected: value }).run(
        log(`${value.length} of ${people.length} selected`)
      ),
  },
  view: (h, model) =>
    CheckboxGroup(h, {
      props: {
        value: model.selected,
        allValues: people.map((person) => person.id),
      },
      onEmit: (event) =>
        event._tag === "ValueChange"
          ? ExampleMessage.ChangedSelection({ value: event.value })
          : undefined,
      view: (group) =>
        group.group(h.div.attr("aria-label", "Team members")).children(
          h.table.children(
            h.caption
              .attr("data-slot", "visually-hidden")
              .children("Team members"),
            h.thead.children(
              h.tr.children(
                Checkbox(h, {
                  key: "parent",
                  props: { parent: true, group: group.join },
                  view: (checkbox) =>
                    h.th.children(
                      checkbox
                        .root(h.button.attr("aria-label", "Select all"))
                        .children(
                          checkbox.indicator(
                            h.span.children(
                              Icon(h, "M20 6 9 17l-5-5"),
                              Icon(h, "M5 12h14")
                            )
                          )
                        ),
                      checkbox.input(h.input)
                    ),
                }),
                h.th.children("Name"),
                h.th.children("Email"),
                h.th.children("Role")
              )
            ),
            h.tbody.children(
              people.map((person) =>
                h.tr.key(person.id).children(
                  Checkbox(h, {
                    props: { value: person.id, group: group.join },
                    view: (checkbox) =>
                      h.td.children(
                        checkbox
                          .root(
                            h.button.attr("aria-label", `Select ${person.name}`)
                          )
                          .children(
                            checkbox.indicator(
                              h.span.children(Icon(h, "M20 6 9 17l-5-5"))
                            )
                          ),
                        checkbox.input(h.input)
                      ),
                  }),
                  h.td.children(person.name),
                  h.td.children(person.email),
                  h.td.children(person.role)
                )
              )
            )
          ),
          group.input(h.input)
        ),
    }),
})

export { Example }
