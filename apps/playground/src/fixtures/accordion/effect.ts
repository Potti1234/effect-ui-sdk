import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Accordion, createAccordionController } from "@ui-sdk/effect/accordion"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { accordionFixture, describeValue } from "tests/fixtures/accordion.ts"
import { accordionOptions } from "tests/fixtures/page.ts"
import { mountFixture } from "../../ssr/effect-mount"

const controller = createAccordionController()

const FixtureProps = Schema.Struct({
  defaultValue: Schema.optional(Schema.Array(Schema.String)),
  multiple: Schema.Boolean,
  disabled: Schema.Boolean,
  keepMounted: Schema.Boolean,
  hiddenUntilFound: Schema.Boolean,
  cancel: Schema.NullOr(Schema.String),
  collapsible: Schema.optional(Schema.Boolean),
})

const FixtureMessage = UiSchema.TaggedEnum({
  RequestedValueChangeSections: { value: Schema.Array(Schema.String) },
  SettledSection: { value: Schema.String, open: Schema.Boolean },
  ClickedShowSupport: {},
  ClickedDone: { value: Schema.String },
  ClickedToggleWarranty: {},
})

const OpenSection = Command.make(
  "OpenSection",
  { args: { value: Schema.String } },
  ({ value }) =>
    Effect.sync(() => {
      controller.open(value)
      return Component.noop
    })
)

const CloseSection = Command.make(
  "CloseSection",
  { args: { value: Schema.String } },
  ({ value }) =>
    Effect.sync(() => {
      controller.close(value)
      return Component.noop
    })
)

const Fixture = Html.component({
  name: "AccordionFixture",
  props: FixtureProps,
  model: Schema.Struct({
    value: Schema.Array(Schema.String),
    action: Schema.String,
    completed: Schema.String,
    warrantyEnabled: Schema.Boolean,
  }),
  message: FixtureMessage,
}).make({
  init: ($) => ({
    value: $.props.defaultValue ?? [],
    action: "",
    completed: "",
    warrantyEnabled: false,
  }),
  update: {
    RequestedValueChangeSections: ($, { value }) => {
      const { cancel } = $.props
      return cancel && value.includes(cancel) && !$.model.value.includes(cancel)
        ? $.model
        : $.evolve({ value, action: describeValue(value) })
    },
    SettledSection: ($, { value, open }) =>
      $.evolve({ completed: `${value} ${open ? "open" : "closed"}` }),
    ClickedShowSupport: ($) => $.run(OpenSection.make({ value: "support" })),
    ClickedDone: ($, { value }) => $.run(CloseSection.make({ value })),
    ClickedToggleWarranty: ($) =>
      $.evolve({ warrantyEnabled: (enabled) => !enabled }),
  },
  view: (h, model) => {
    const { cancel, defaultValue, ...options } = h.props
    return h.div.class("fixture").children(
      h.button.children("Before"),
      Accordion(h, {
        props: {
          ...options,
          controller,
          ...(cancel ? { value: model.value } : { defaultValue }),
        },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? FixtureMessage.RequestedValueChangeSections({
                value: event.value as string[],
              })
            : event._tag === "ItemOpenChangeComplete"
              ? FixtureMessage.SettledSection({
                  value: event.key ?? "",
                  open: event.value as boolean,
                })
              : undefined,
        view: (accordion) =>
          accordion.root(h.div.class("accordion")).children(
            accordionFixture.items.map((item) => {
              const section = accordion.in("item", { value: item.value })
              return accordion
                .item(h.div.key(item.value).class("accordion-item"), {
                  value: item.value,
                  disabled: !!item.disabled && !model.warrantyEnabled,
                })
                .children(
                  section
                    .header(h.h3.class("accordion-header"))
                    .children(
                      section
                        .trigger(h.button.class("accordion-trigger"))
                        .children(item.label)
                    ),
                  section.panel(
                    h.div
                      .class("accordion-panel")
                      .children(
                        item.content,
                        item.field &&
                          h.label.children(` ${item.field} `, h.input),
                        item.close &&
                          h.button
                            .on(
                              "click",
                              FixtureMessage.ClickedDone({ value: item.value })
                            )
                            .children(item.close)
                      )
                  )
                )
            })
          ),
      }),
      h.button.children("After"),
      h.output
        .attr("role", "status")
        .attr("aria-label", "Last action")
        .children(model.action),
      h.output.attr("aria-label", "Last completed").children(model.completed),
      h.button
        .on("click", FixtureMessage.ClickedShowSupport())
        .children("Show support"),
      h.button
        .on("click", FixtureMessage.ClickedToggleWarranty())
        .children("Toggle warranty")
    )
  },
})

const props = () => {
  const { cancel, collapsible, ...options } = accordionOptions()
  return {
    ...options,
    cancel,
    ...(collapsible === undefined ? {} : { collapsible }),
  }
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
