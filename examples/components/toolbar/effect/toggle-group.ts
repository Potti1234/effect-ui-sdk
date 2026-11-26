import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toggle, ToggleGroup } from "@ui-sdk/effect/toggle"
import { Toolbar, toolbarScope } from "@ui-sdk/effect/toolbar"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const icon =
  (paths: string[]) =>
  <M>(h: Html.H<M>) =>
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
      .children(paths.map((d) => h.el("path").attr("d", d)))
const AlignLeft = icon(["M21 5H3", "M15 12H3", "M17 19H3"])
const AlignCenter = icon(["M21 5H3", "M17 12H7", "M19 19H5"])
const AlignRight = icon(["M21 5H3", "M21 12H9", "M21 19H7"])
const List = icon([
  "M3 5h.01",
  "M3 12h.01",
  "M3 19h.01",
  "M8 5h13",
  "M8 12h13",
  "M8 19h13",
])
const ListOrdered = icon([
  "M11 5h10",
  "M11 12h10",
  "M11 19h10",
  "M4 4h1v5",
  "M4 9h2",
  "M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02",
])

const alignments = [
  { value: "left", label: "Align left", icon: AlignLeft },
  { value: "center", label: "Align center", icon: AlignCenter },
  { value: "right", label: "Align right", icon: AlignRight },
]

const lists = [
  { value: "bulleted", label: "Bulleted list", icon: List },
  { value: "numbered", label: "Numbered list", icon: ListOrdered },
]

const ExampleMessage = UiSchema.TaggedEnum({
  ChangedAlignment: { value: Schema.String },
  ChangedList: { value: Schema.optional(Schema.String) },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    ChangedAlignment: ($, { value }) => $.set(null).run(log(`Align ${value}`)),
    ChangedList: ($, { value }) =>
      $.set(null).run(
        log(lists.find((list) => list.value === value)?.label ?? "No list")
      ),
  },
  view: (h) =>
    Toolbar(h, {
      view: (toolbar) =>
        toolbar.root(h.div.attr("aria-label", "Paragraph")).children(
          ToggleGroup(h, {
            key: "alignment",
            props: {
              defaultValue: ["left"],
              deselectable: false,
              toolbar: toolbarScope(toolbar.join),
            },
            onEmit: (event) =>
              event._tag === "ValueChange"
                ? ExampleMessage.ChangedAlignment({
                    value: (event.value as string[])[0],
                  })
                : undefined,
            view: (group) =>
              group.group(h.div.attr("aria-label", "Alignment")).children(
                alignments.map((alignment) =>
                  Toggle(h, {
                    key: alignment.value,
                    props: { value: alignment.value, group: group.join },
                    view: (toggle) =>
                      toggle
                        .root(h.button.attr("aria-label", alignment.label))
                        .children(
                          toggle.icon(h.span.children(alignment.icon(h)))
                        ),
                  })
                )
              ),
          }),
          toolbar.separator(h.div),
          ToggleGroup(h, {
            key: "list",
            props: { toolbar: toolbarScope(toolbar.join) },
            onEmit: (event) =>
              event._tag === "ValueChange"
                ? ExampleMessage.ChangedList({
                    value: (event.value as string[])[0],
                  })
                : undefined,
            view: (group) =>
              group.group(h.div.attr("aria-label", "List")).children(
                lists.map((list) =>
                  Toggle(h, {
                    key: list.value,
                    props: { value: list.value, group: group.join },
                    view: (toggle) =>
                      toggle
                        .root(h.button.attr("aria-label", list.label))
                        .children(toggle.icon(h.span.children(list.icon(h)))),
                  })
                )
              ),
          })
        ),
    }),
})

export { Example }
