import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toolbar } from "@ui-sdk/effect/toolbar"
import * as Schema from "effect/Schema"
import { mountFixture } from "../../ssr/effect-mount"

const FixtureMessage = UiSchema.TaggedEnum({
  Acted: { action: Schema.String },
})

const Fixture = Html.component({
  name: "ToolbarRenderFixture",
  model: Schema.Struct({ action: Schema.String }),
  message: FixtureMessage,
}).make({
  init: () => ({ action: "" }),
  update: {
    Acted: ($, { action }) => $.evolve({ action }),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Toolbar(h, {
        view: (toolbar) =>
          toolbar
            .root(h.div.class("toolbar").attr("aria-label", "Tools"))
            .children(
              toolbar
                .button(
                  h.span.on("click", FixtureMessage.Acted({ action: "span" }))
                )
                .children("Span tool"),
              toolbar
                .button(
                  h.button.on("click", FixtureMessage.Acted({ action: "cut" }))
                )
                .children("Cut"),
              toolbar
                .button(
                  h.button.on("click", FixtureMessage.Acted({ action: "copy" }))
                )
                .children("Copy"),
              toolbar.separator(h.hr.class("rule")),
              toolbar
                .button(
                  h.a
                    .class(
                      toolbar.button.state({ disabled: true }).disabled
                        ? "is-disabled"
                        : "is-enabled"
                    )
                    .attr("href", "#old"),
                  { disabled: true }
                )
                .children("Old docs")
            ),
      }),
      h.button.key("after").children("After"),
      h.output
        .key("action")
        .attrs({ role: "status", "aria-label": "Last action" })
        .children(model.action)
    ),
})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, {})
}

export { mount }
