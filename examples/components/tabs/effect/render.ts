import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const folders = [
  {
    value: "inbox",
    label: "Inbox",
    count: 12,
    content: "12 conversations, 3 of them unread.",
  },
  {
    value: "unread",
    label: "Unread",
    count: 3,
    content: "Hollis Grant, Inès Moreau and Kofi Mensah wrote to you.",
  },
  {
    value: "archived",
    label: "Archived",
    count: 0,
    content: "Nothing archived yet. Archived mail stays searchable.",
  },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Tabs(h, {
      props: { defaultValue: "inbox" },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs
            .list(h.div.attr("aria-label", "Mail"))
            .children(
              folders.map((folder) =>
                tabs
                  .tab(h.button.key(folder.value), { value: folder.value })
                  .children(
                    folder.label,
                    folder.count > 0 &&
                      h.span
                        .attr("data-slot", "badge")
                        .children(String(folder.count))
                  )
              )
            ),
          folders.map((folder) =>
            tabs.panel(h.div.key(folder.value).children(folder.content), {
              value: folder.value,
            })
          )
        ),
    }),
})

export { Example }
