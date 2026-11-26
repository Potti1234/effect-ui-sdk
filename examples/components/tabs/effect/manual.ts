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
      props: { defaultValue: "preview", activation: "manual" },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs
            .list(h.div.attr("aria-label", "Snippet"))
            .children(
              tabs.tab(h.button, { value: "preview" }).children("Preview"),
              tabs.tab(h.button, { value: "code" }).children("Code")
            ),
          tabs.panel(
            h.div.children("Welcome back, Hollis. You have 3 unread messages."),
            { value: "preview" }
          ),
          tabs.panel(
            h.div.children(
              Field(h, {
                key: "source",
                view: (field) =>
                  field
                    .root(h.div)
                    .children(
                      field.label(h.label).children("Source"),
                      field.control(
                        h.input.attr(
                          "value",
                          '<Welcome name="Hollis" unread={3} />'
                        )
                      )
                    ),
              })
            ),
            { value: "code" }
          )
        ),
    }),
})

export { Example }
