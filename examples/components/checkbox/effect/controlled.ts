import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Checkbox, createCheckboxController } from "@ui-sdk/effect/checkbox"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const Checked = Schema.Union([Schema.Boolean, Schema.Literal("indeterminate")])

const updates = createCheckboxController()

const ToggleUpdates = Command.make("ToggleUpdates", { args: {} }, () =>
  Effect.sync(() => {
    updates.toggle()
    return Component.noop
  })
)

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedCheckedChangeUpdates: { checked: Checked, reason: Schema.String },
  ClickedToggle: {},
})

const Check = <M>(h: Html.H<M>) =>
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
    .children(h.el("path").attr("d", "M20 6 9 17l-5-5"))

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ checked: Checked }),
  message: ExampleMessage,
}).make({
  init: () => ({ checked: false }),
  update: {
    RequestedCheckedChangeUpdates: ($, { checked, reason }) =>
      $.evolve({ checked }).run(
        log(
          `${checked === "indeterminate" ? "Mixed" : checked ? "Checked" : "Unchecked"} (${reason})`
        )
      ),
    ClickedToggle: ($) => $.run(ToggleUpdates.make({})),
  },
  view: (h, model) =>
    h.div.attr("data-slot", "stack").children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedToggle())
            .children("Toggle")
        ),
      Checkbox(h, {
        props: { checked: model.checked, controller: updates },
        onEmit: (event) =>
          event._tag === "CheckedChange"
            ? ExampleMessage.RequestedCheckedChangeUpdates({
                checked: event.value,
                reason: event.reason ?? "imperative",
              })
            : undefined,
        view: (checkbox) =>
          h.label
            .attr("data-slot", "label")
            .children(
              checkbox
                .root(h.button)
                .children(checkbox.indicator(h.span.children(Check(h)))),
              checkbox.input(h.input),
              "Email me about product updates"
            ),
      })
    ),
})

export { Example }
