import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import { Separator } from "@ui-sdk/effect/separator"
import { Toggle, ToggleGroup } from "@ui-sdk/effect/toggle"
import * as Schema from "effect/Schema"
import { mountFixture } from "../../ssr/effect-mount"

const FixtureMessage = UiSchema.TaggedEnum({
  Acted: { action: Schema.String },
})

const Fixture = Html.component({
  name: "ToggleRenderFixture",
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
      Button(h, {
        key: "span",
        onEmit: () => FixtureMessage.Acted({ action: "span" }),
        view: (button) =>
          button.root(h.span.class("button")).children("Span button"),
      }),
      Button(h, {
        key: "old",
        props: { disabled: true },
        view: (button) =>
          button
            .root(h.a.class("button").attr("href", "#old"))
            .children("Old docs"),
      }),
      Toggle(h, {
        key: "star",
        onEmit: (event) =>
          event._tag === "PressedChange"
            ? FixtureMessage.Acted({ action: event.value ? "star" : "unstar" })
            : undefined,
        view: (toggle) =>
          toggle
            .root(
              h.button.class(
                "toggle",
                toggle.state.pressed ? "is-pressed" : "is-unpressed"
              )
            )
            .children(
              h.span
                .attr("aria-hidden", "true")
                .children(toggle.state.pressed ? "★" : "☆"),
              " Star"
            ),
      }),
      ToggleGroup(h, {
        props: { defaultValue: ["grid"] },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? FixtureMessage.Acted({
                action: (event.value as string[]).join(", "),
              })
            : undefined,
        view: (group) =>
          group
            .group(h.div.class("toggle-group").attr("aria-label", "View"))
            .children(
              Toggle(h, {
                key: "grid",
                props: { value: "grid", group: group.join },
                view: (toggle) =>
                  toggle.root(h.span.class("toggle")).children("Grid"),
              }),
              Toggle(h, {
                key: "list",
                props: { value: "list", group: group.join },
                view: (toggle) =>
                  toggle.root(h.span.class("toggle")).children("List"),
              })
            ),
      }),
      Separator(h, {
        view: (separator) => separator.root(h.hr.class("rule")),
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
