import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Accordion, createAccordionController } from "@ui-sdk/effect/accordion"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const items = [
  {
    value: "account",
    label: "Account",
    content: "Your name, email address and profile photo.",
  },
  {
    value: "security",
    label: "Security",
    content: "Your password, passkeys and two-factor authentication.",
  },
  {
    value: "sessions",
    label: "Sessions",
    content: "Devices signed in to your account in the last 30 days.",
  },
]

const accordion = createAccordionController()

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedValueChangeSettings: { value: Schema.Array(Schema.String) },
  ConfirmedCloseSecurity: { value: Schema.Array(Schema.String) },
  ClickedReviewSecurity: {},
})

const ConfirmCloseSecurity = Command.make(
  "ConfirmCloseSecurity",
  { args: { value: Schema.Array(Schema.String) } },
  ({ value }) =>
    Effect.sync(() =>
      window.confirm("Close the security settings?")
        ? ExampleMessage.ConfirmedCloseSecurity({ value })
        : Component.noop
    )
)

const OpenSecurity = Command.make("OpenSecurity", { args: {} }, () =>
  Effect.sync(() => {
    accordion.open("security")
    return Component.noop
  })
)

const Chevron = <M>(h: Html.H<M>) =>
  h
    .el("svg")
    .attrs({
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    })
    .children(h.el("path").attr("d", "m6 9 6 6 6-6"))

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ value: Schema.Array(Schema.String) }),
  message: ExampleMessage,
}).make({
  init: () => ({ value: ["account"] }),
  update: {
    RequestedValueChangeSettings: ($, { value }) =>
      $.model.value.includes("security") && !value.includes("security")
        ? $.run(ConfirmCloseSecurity.make({ value }))
        : $.evolve({ value }),
    ConfirmedCloseSecurity: ($, { value }) => $.evolve({ value }),
    ClickedReviewSecurity: ($) => $.run(OpenSecurity.make({})),
  },
  view: (h, model) =>
    h.div.children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedReviewSecurity())
            .children("Review security")
        ),
      Accordion(h, {
        props: { multiple: true, value: model.value, controller: accordion },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? ExampleMessage.RequestedValueChangeSettings({
                value: event.value,
              })
            : undefined,
        view: (settings) =>
          settings.root(h.div).children(
            items.map((item) => {
              const section = settings.in("item", { value: item.value })
              return settings
                .item(h.div.key(item.value), { value: item.value })
                .children(
                  section
                    .header(h.h3)
                    .children(
                      section.trigger(h.button).children(item.label, Chevron(h))
                    ),
                  section.panel(h.div.children(item.content))
                )
            })
          ),
      })
    ),
})

export { Example }
