import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Tabs(h, {
      props: { defaultValue: "reply" },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs
            .list(h.div.attr("aria-label", "Comment"))
            .children(
              tabs.tab(h.button, { value: "reply" }).children("Reply"),
              tabs
                .tab(h.button, { value: "formatting" })
                .children("Formatting"),
              tabs.indicator(h.span)
            ),
          tabs.panel(
            h.div.children(
              Field(h, {
                key: "message",
                view: (field) =>
                  field.root(h.div).children(
                    field.label(h.label).children("Message"),
                    field.control(
                      h.textarea.attrs({
                        rows: "3",
                        placeholder: "Write a reply…",
                      })
                    )
                  ),
              })
            ),
            { value: "reply", keepMounted: true }
          ),
          tabs.panel(
            h.div.children(
              h.p.children(
                "Use **bold**, _italics_ and `code` to format your reply."
              ),
              h.p.children("Paste a link on its own line to show a preview.")
            ),
            { value: "formatting" }
          )
        ),
    }),
})

export { Example }
