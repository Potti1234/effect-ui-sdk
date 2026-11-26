import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { createPopoverController, Popover } from "@ui-sdk/effect/popover"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import {
  popoverContentOptions,
  popoverFixture as f,
  popoverOptions,
  popoverParts,
} from "tests/fixtures/popover.ts"
import { mountFixture } from "../../ssr/effect-mount"

const controller = createPopoverController()

const FixtureProps = Schema.Struct({
  options: Schema.Record(Schema.String, Schema.Unknown),
  content: Schema.Record(Schema.String, Schema.Unknown),
  parts: Schema.Struct({
    title: Schema.Boolean,
    nested: Schema.Boolean,
    menu: Schema.Boolean,
    removable: Schema.Boolean,
    shortcut: Schema.Boolean,
  }),
})

const FixtureMessage = UiSchema.TaggedEnum({
  ClickedSave: {},
  ClickedRemoveTrigger: {},
  ClickedArchive: {},
  ClickedOpenWithController: {},
})

const OpenPopover = Command.make("OpenPopover", { args: {} }, () =>
  Effect.sync(() => {
    controller.open()
    return Component.noop
  })
)

const Fixture = Html.component({
  name: "PopoverFixture",
  props: FixtureProps,
  model: Schema.Struct({
    action: Schema.String,
    triggerShown: Schema.Boolean,
  }),
  message: FixtureMessage,
}).make({
  init: () => ({ action: "", triggerShown: true }),
  update: {
    ClickedSave: ($) => $.evolve({ action: "save" }),
    ClickedRemoveTrigger: ($) => $.evolve({ triggerShown: false }),
    ClickedArchive: ($) => $.evolve({ action: "archive" }),
    ClickedOpenWithController: ($) => $.run(OpenPopover.make({})),
  },
  view: (h, model) => {
    const { parts } = h.props
    return Popover(h, {
      props: { ...h.props.options, controller },
      view: (popover) =>
        h.div.class("fixture").children(
          h.button.children("Before"),
          model.triggerShown &&
            popover
              .trigger(h.button, {
                shortcut: parts.shortcut ? f.shortcut.trigger : undefined,
              })
              .children(
                f.trigger,
                parts.shortcut &&
                  popover.shortcut(h.kbd, { shortcut: f.shortcut.trigger })
              ),
          popover.content(
            h.div.class("popup").children(
              popover.arrow(h.div.class("arrow")),
              parts.title &&
                popover.title(h.h2.class("title")).children(f.title),
              popover
                .description(h.p.class("description"))
                .children(f.description),
              h.label
                .class("field")
                .children(f.field, h.input.attr("value", f.defaultValue)),
              h.div
                .class("actions")
                .children(
                  h.button
                    .on("click", FixtureMessage.ClickedSave())
                    .children(
                      f.action,
                      parts.shortcut &&
                        popover.shortcut(h.kbd, { shortcut: f.shortcut.save })
                    ),
                  popover.close(h.button).children(f.close),
                  parts.removable &&
                    h.button
                      .on("click", FixtureMessage.ClickedRemoveTrigger())
                      .children(f.remove)
                ),
              parts.nested &&
                Popover(h, {
                  key: "nested",
                  view: (nested) =>
                    h.div.children(
                      nested.trigger(h.button).children(f.nested.trigger),
                      nested.content(
                        h.div
                          .class("popup")
                          .children(
                            nested
                              .title(h.h2.class("title"))
                              .children(f.nested.title),
                            h.button
                              .on("click", FixtureMessage.ClickedArchive())
                              .children(f.nested.action)
                          )
                      )
                    ),
                })
            ),
            { sideOffset: 8, ...h.props.content }
          ),
          h.button.key("after").children("After"),
          h.output
            .key("action")
            .attrs({ role: "status", "aria-label": "Last action" })
            .children(model.action),
          h.button
            .key("open")
            .on("click", FixtureMessage.ClickedOpenWithController())
            .children("Open with controller"),
          parts.shortcut &&
            popover
              .trigger(h.button.key("share"), {
                shortcut: f.shortcut.remote.keys,
              })
              .children(
                f.shortcut.remote.trigger,
                popover.shortcut(h.kbd, { shortcut: f.shortcut.remote.keys })
              )
        ),
    })
  },
})

const props = () => {
  const { container, ...options } = popoverOptions() as Record<string, unknown>
  return {
    options,
    content: popoverContentOptions(),
    parts: popoverParts(),
  }
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
