import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as View from "@effect/ui/View"
import * as Html from "@effect/ui/html/Html"
import { Toggle, ToggleGroup } from "@ui-sdk/effect/toggle"
import {
  Toolbar,
  createToolbarController,
  toolbarScope,
} from "@ui-sdk/effect/toolbar"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import {
  toolbarFixture as f,
  toolbarLocked,
  toolbarOptions,
  toolbarRenderedToggle,
} from "tests/fixtures/toolbar.ts"
import { mountFixture } from "../../ssr/effect-mount"

const controller = createToolbarController()

const FixtureProps = Schema.Struct({
  orientation: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  loop: Schema.optional(Schema.Boolean),
  disabled: Schema.optional(Schema.Boolean),
  locked: Schema.Boolean,
  renderedToggle: Schema.Boolean,
})

const FixtureMessage = UiSchema.TaggedEnum({
  Acted: { action: Schema.String },
  ClickedFocusToolbar: {},
  ClickedUnlock: {},
})

const FocusToolbar = Command.make("FocusToolbar", { args: {} }, () =>
  Effect.sync(() => {
    controller.focus()
    return Component.noop
  })
)

type ToggleGroupFixture = typeof f.style & {
  items: { value: string; label: string; disabled?: boolean }[]
}

const Fixture = Html.component({
  name: "ToolbarFixture",
  props: FixtureProps,
  model: Schema.Struct({ action: Schema.String, locked: Schema.Boolean }),
  message: FixtureMessage,
}).make({
  init: ($) => ({ action: "", locked: $.props.locked }),
  update: {
    Acted: ($, { action }) => $.evolve({ action }),
    ClickedFocusToolbar: ($) => $.run(FocusToolbar.make({})),
    ClickedUnlock: ($) => $.evolve({ locked: false }),
  },
  view: (h, model) => {
    const { locked, renderedToggle, ...options } = h.props
    return h.div.class("fixture").children(
      h.button.children("Before"),
      Toolbar(h, {
        props: { ...options, controller },
        view: (toolbar) => {
          // Wraps an item in a disabled group while locked, for ?locked.
          const lock = (
            label: string,
            item: (
              inGroup: typeof toolbar,
              disabled: boolean
            ) => View.Input<typeof FixtureMessage.Type>
          ) => {
            if (!locked) {
              return item(toolbar, false)
            }
            const props = { disabled: model.locked }
            return toolbar
              .group(h.div.key(label).attr("aria-label", label), props)
              .children(item(toolbar.in("group", props), model.locked))
          }
          const group = (
            { label, defaultValue, items }: ToggleGroupFixture,
            multiple: boolean,
            disabled: boolean
          ) =>
            ToggleGroup(h, {
              key: label,
              props: {
                multiple,
                defaultValue,
                toolbar: toolbarScope(toolbar.join, disabled),
              },
              onEmit: (event) =>
                event._tag === "ValueChange"
                  ? FixtureMessage.Acted({
                      action: `${label}: ${(event.value as string[]).join(", ") || "none"}`,
                    })
                  : undefined,
              view: (toggleGroup) =>
                toggleGroup
                  .group(h.div.class("toggle-group").attr("aria-label", label))
                  .children(
                    items.map((item) =>
                      Toggle(h, {
                        key: `${label}-${item.value}`,
                        props: {
                          value: item.value,
                          disabled: item.disabled,
                          group: toggleGroup.join,
                        },
                        view: (toggle) =>
                          toggle
                            .root(h.button.class("toggle"))
                            .children(item.label),
                      })
                    )
                  ),
            })
          const spellcheck = (inGroup: typeof toolbar, disabled: boolean) =>
            Toggle(h, {
              key: "spellcheck",
              props: { toolbar: toolbarScope(toolbar.join, disabled) },
              onEmit: (event) =>
                event._tag === "PressedChange"
                  ? FixtureMessage.Acted({
                      action: `spellcheck: ${event.value ? "on" : "off"}`,
                    })
                  : undefined,
              view: (toggle) => {
                const root = toggle.root(h.button.class("toggle"))
                return (renderedToggle ? inGroup.button(root) : root).children(
                  f.spellcheck.label
                )
              },
            })

          return toolbar
            .root(h.div.class("toolbar").attr("aria-label", f.label))
            .children(
              lock("Locked style", (_, disabled) =>
                group(f.style, true, disabled)
              ),
              toolbar.separator(h.div.key("first-separator")),
              group(f.alignment, false, false),
              toolbar.separator(h.div.key("second-separator")),
              toolbar.button(h.button.key("font")).children(f.font.trigger),
              toolbar.input(
                h.input.key("size").attrs({
                  "aria-label": f.size.label,
                  value: String(f.size.defaultValue),
                })
              ),
              toolbar.input(
                h.input.key("comment").attrs({
                  "aria-label": f.comment.label,
                  value: f.comment.defaultValue,
                })
              ),
              (() => {
                const disabled = locked && model.locked
                const history = toolbar.in("group", { disabled })
                return toolbar
                  .group(
                    h.div
                      .key("history")
                      .class("toolbar-group")
                      .attr("aria-label", f.history.label),
                    { disabled }
                  )
                  .children(
                    f.history.items.map((item) =>
                      history
                        .button(
                          h.button.key(item.label).on(
                            "click",
                            FixtureMessage.Acted({
                              action: item.label.toLowerCase(),
                            })
                          ),
                          { disabled: "disabled" in item && item.disabled }
                        )
                        .children(item.label)
                    )
                  )
              })(),
              lock("Locked proofing", spellcheck),
              lock("Locked help", (inGroup) =>
                inGroup
                  .link(h.a.key("help").attr("href", f.help.href))
                  .children(f.help.label)
              )
            )
        },
      }),
      h.button.key("after").children("After"),
      h.output
        .key("action")
        .attrs({ role: "status", "aria-label": "Last action" })
        .children(model.action),
      h.button
        .key("focus")
        .on("click", FixtureMessage.ClickedFocusToolbar())
        .children("Focus toolbar"),
      h.button
        .key("unlock")
        .on("click", FixtureMessage.ClickedUnlock())
        .children("Unlock")
    )
  },
})

const props = () => ({
  ...toolbarOptions(),
  locked: toolbarLocked(),
  renderedToggle: toolbarRenderedToggle(),
})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
