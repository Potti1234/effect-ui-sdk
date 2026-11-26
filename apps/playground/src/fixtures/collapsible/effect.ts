import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import {
  Collapsible,
  createCollapsibleController,
} from "@ui-sdk/effect/collapsible"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { collapsibleFixture as fixture } from "tests/fixtures/collapsible.ts"
import { collapsibleOptions } from "tests/fixtures/page.ts"
import { mountFixture } from "../../ssr/effect-mount"

const controller = createCollapsibleController()

const FixtureProps = Schema.Struct({
  defaultOpen: Schema.Boolean,
  disabled: Schema.Boolean,
  keepMounted: Schema.Boolean,
  hiddenUntilFound: Schema.Boolean,
  cancel: Schema.NullOr(Schema.String),
})

const FixtureMessage = UiSchema.TaggedEnum({
  RequestedOpenChangeDetails: {
    open: Schema.Boolean,
    reason: Schema.String,
    source: Schema.String,
  },
  SettledDetails: { open: Schema.Boolean },
  ClickedDone: {},
  ClickedToggle: {},
})

const CloseDetails = Command.make("CloseDetails", { args: {} }, () =>
  Effect.sync(() => {
    controller.close()
    return Component.noop
  })
)

const ToggleDetails = Command.make("ToggleDetails", { args: {} }, () =>
  Effect.sync(() => {
    controller.toggle()
    return Component.noop
  })
)

const Fixture = Html.component({
  name: "CollapsibleFixture",
  props: FixtureProps,
  model: Schema.Struct({
    open: Schema.Boolean,
    action: Schema.String,
    reason: Schema.String,
    source: Schema.String,
    completed: Schema.String,
  }),
  message: FixtureMessage,
}).make({
  init: ($) => ({
    open: $.props.defaultOpen,
    action: "",
    reason: "",
    source: "",
    completed: "",
  }),
  update: {
    RequestedOpenChangeDetails: ($, { open, reason, source }) =>
      $.props.cancel === (open ? "open" : "close")
        ? $.model
        : $.evolve({ open, action: open ? "open" : "closed", reason, source }),
    SettledDetails: ($, { open }) =>
      $.evolve({ completed: open ? "open" : "closed" }),
    ClickedDone: ($) => $.run(CloseDetails.make({})),
    ClickedToggle: ($) => $.run(ToggleDetails.make({})),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Collapsible(h, {
        props: {
          open: model.open,
          disabled: h.props.disabled,
          controller,
        },
        onEmit: {
          OpenChange: ({ value, reason, source }) =>
            FixtureMessage.RequestedOpenChangeDetails({
              open: value,
              reason: reason ?? "",
              source: source ?? "",
            }),
          OpenChangeComplete: ({ value }) =>
            FixtureMessage.SettledDetails({ open: value }),
        },
        view: (collapsible) =>
          collapsible.root(h.div.class("collapsible")).children(
            collapsible
              .trigger(h.button.class("collapsible-trigger"))
              .children(fixture.trigger),
            collapsible.panel(
              h.div
                .class("collapsible-panel")
                .children(
                  h.p.children(fixture.content),
                  h.label.children(`${fixture.field} `, h.input),
                  h.button
                    .on("click", FixtureMessage.ClickedDone())
                    .children(fixture.close)
                ),
              {
                keepMounted: h.props.keepMounted,
                hiddenUntilFound: h.props.hiddenUntilFound,
              }
            )
          ),
      }),
      h.button.children("After"),
      h.output
        .attr("role", "status")
        .attr("aria-label", "Last action")
        .children(model.action),
      h.output.attr("aria-label", "Last reason").children(model.reason),
      h.output.attr("aria-label", "Last source").children(model.source),
      h.output.attr("aria-label", "Last completed").children(model.completed),
      h.button
        .on("click", FixtureMessage.ClickedToggle())
        .children(fixture.controller)
    ),
})

const props = () => {
  const { cancel, ...options } = collapsibleOptions()
  return { ...options, cancel }
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
