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
import { log } from "../../../shared/effect/log"

const recoveryCodes = ["7KQ2-M9XD", "P4TR-8HZC", "W3NB-6JUE", "C5YF-2LSA"]

const collapsible = createCollapsibleController()

const ToggleCodes = Command.make("ToggleCodes", { args: {} }, () =>
  Effect.sync(() => {
    collapsible.toggle()
    return Component.noop
  })
)

const CloseCodes = Command.make("CloseCodes", { args: {} }, () =>
  Effect.sync(() => {
    collapsible.close()
    return Component.noop
  })
)

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedOpenChangeCodes: { open: Schema.Boolean, reason: Schema.String },
  ClickedToggle: {},
  ClickedDone: {},
})

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
  model: Schema.Struct({ open: Schema.Boolean }),
  message: ExampleMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    RequestedOpenChangeCodes: ($, { open, reason }) =>
      $.evolve({ open }).run(log(`${open ? "Opened" : "Closed"} (${reason})`)),
    ClickedToggle: ($) => $.run(ToggleCodes.make({})),
    ClickedDone: ($) => $.run(CloseCodes.make({})),
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
      Collapsible(h, {
        props: { open: model.open, controller: collapsible },
        onEmit: (event) =>
          event._tag === "OpenChange"
            ? ExampleMessage.RequestedOpenChangeCodes({
                open: event.value,
                reason: event.reason ?? "imperative",
              })
            : undefined,
        view: (codes) =>
          codes
            .root(h.div.attr("data-variant", "card"))
            .children(
              codes
                .trigger(h.button)
                .children(
                  h.span
                    .attr("data-slot", "stack")
                    .children(
                      h.span.children("Recovery codes"),
                      h.span
                        .attr("data-slot", "hint")
                        .children("Each code signs you in once")
                    ),
                  Chevron(h)
                ),
              codes.panel(
                h.div.children(
                  h.div
                    .attr("data-slot", "stack")
                    .children(
                      h.ul.children(
                        recoveryCodes.map((code) => h.li.children(code))
                      ),
                      h.button
                        .attr("type", "button")
                        .on("click", ExampleMessage.ClickedDone())
                        .children("Done")
                    )
                )
              )
            ),
      })
    ),
})

export { Example }
