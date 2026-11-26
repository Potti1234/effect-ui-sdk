import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Collapsible } from "@ui-sdk/effect/collapsible"
import * as Schema from "effect/Schema"
import { mountFixture } from "../../ssr/effect-mount"

const FixtureMessage = UiSchema.TaggedEnum({
  ToggledFiles: { open: Schema.Boolean },
})

const Fixture = Html.component({
  name: "CollapsibleRenderFixture",
  model: Schema.Struct({ action: Schema.String }),
  message: FixtureMessage,
}).make({
  init: () => ({ action: "" }),
  update: {
    ToggledFiles: ($, { open }) =>
      $.evolve({ action: open ? "open" : "closed" }),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Collapsible(h, {
        onEmit: (event) =>
          event._tag === "OpenChange"
            ? FixtureMessage.ToggledFiles({ open: event.value })
            : undefined,
        view: (collapsible) =>
          collapsible
            .root(
              h.div.class(
                "collapsible",
                collapsible.state.open ? "is-open" : "is-closed"
              )
            )
            .children(
              collapsible
                .trigger(h.div.class("collapsible-trigger"))
                .children(
                  "Files",
                  h.span
                    .attr("aria-hidden", "true")
                    .children(` ${collapsible.state.open ? "−" : "+"}`)
                ),
              collapsible.panel(
                h.section
                  .class("collapsible-panel")
                  .children("The files panel.")
              )
            ),
      }),
      h.button.children("After"),
      h.output
        .attr("role", "status")
        .attr("aria-label", "Last action")
        .children(model.action)
    ),
})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, {})
}

export { mount }
