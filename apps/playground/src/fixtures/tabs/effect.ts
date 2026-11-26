import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { createTabsController, Tabs } from "@ui-sdk/effect/tabs"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { indicatorOptions, tabsOptions } from "tests/fixtures/page.ts"
import { tabsFixture } from "tests/fixtures/tabs.ts"
import { mountFixture } from "../../ssr/effect-mount"

const controller = createTabsController()

const FixtureProps = Schema.Struct({
  defaultValue: Schema.optional(Schema.String),
  keepMounted: Schema.Boolean,
  cancel: Schema.NullOr(Schema.String),
  activation: Schema.optional(Schema.Literals(["automatic", "manual"])),
  orientation: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  followHover: Schema.Boolean,
})

const FixtureMessage = UiSchema.TaggedEnum({
  RequestedValueChangeSettings: { value: Schema.NullOr(Schema.String) },
  ClickedShowNotifications: {},
})

const ShowNotifications = Command.make("ShowNotifications", { args: {} }, () =>
  Effect.sync(() => {
    controller.select("notifications")
    return Component.noop
  })
)

const Fixture = Html.component({
  name: "TabsFixture",
  props: FixtureProps,
  model: Schema.Struct({
    value: Schema.NullOr(Schema.String),
    action: Schema.String,
  }),
  message: FixtureMessage,
}).make({
  init: ($) => ({ value: $.props.defaultValue ?? null, action: "" }),
  update: {
    RequestedValueChangeSettings: ($, { value }) =>
      value === $.props.cancel
        ? $.model
        : $.evolve({ value, action: value ?? "" }),
    ClickedShowNotifications: ($) => $.run(ShowNotifications.make({})),
  },
  view: (h, model) => {
    const { cancel, keepMounted, followHover, defaultValue, ...options } =
      h.props
    return h.div.class("fixture").children(
      h.button.children("Before"),
      Tabs(h, {
        props: {
          ...options,
          controller,
          ...(cancel ? { value: model.value } : { defaultValue }),
        },
        onEmit: {
          ValueChange: ({ value }) =>
            FixtureMessage.RequestedValueChangeSettings({ value }),
        },
        view: (tabs) =>
          tabs.root(h.div.class("tabs")).children(
            tabs
              .list(
                h.div.class("tablist").attr("aria-label", tabsFixture.label)
              )
              .children(
                tabsFixture.tabs.map((tab) =>
                  tabs
                    .tab(h.button.key(tab.value).class("tab"), {
                      value: tab.value,
                      disabled: tab.disabled,
                    })
                    .children(tab.label)
                ),
                tabs.indicator(h.span.class("indicator"), { followHover })
              ),
            tabsFixture.tabs.map((tab) =>
              tabs.panel(
                h.div
                  .key(tab.value)
                  .class("panel")
                  .children(
                    tab.content,
                    tab.field &&
                      h.label.children(
                        ` ${tab.field} `,
                        h.input.attr("type", "password")
                      )
                  ),
                { value: tab.value, keepMounted }
              )
            )
          ),
      }),
      h.button.key("after").children("After"),
      h.output
        .key("action")
        .attrs({ role: "status", "aria-label": "Last action" })
        .children(model.action),
      h.button
        .key("show")
        .on("click", FixtureMessage.ClickedShowNotifications())
        .children("Show notifications")
    )
  },
})

const props = () => {
  const { cancel, ...options } = tabsOptions()
  return {
    ...options,
    cancel,
    ...indicatorOptions(),
  }
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
