import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { createSwitchController, Switch } from "@ui-sdk/effect/switch"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const wifi = createSwitchController()

const ToggleWifi = Command.make("ToggleWifi", { args: {} }, () =>
  Effect.sync(() => {
    wifi.toggle()
    return Component.noop
  })
)

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedCheckedChangeWifi: {
    checked: Schema.Boolean,
    reason: Schema.String,
  },
  ClickedToggle: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ checked: Schema.Boolean }),
  message: ExampleMessage,
}).make({
  init: () => ({ checked: true }),
  update: {
    RequestedCheckedChangeWifi: ($, { checked, reason }) =>
      $.evolve({ checked }).run(log(`${checked ? "On" : "Off"} (${reason})`)),
    ClickedToggle: ($) => $.run(ToggleWifi.make({})),
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
      Switch(h, {
        props: { checked: model.checked, controller: wifi },
        onEmit: (event) =>
          event._tag === "CheckedChange"
            ? ExampleMessage.RequestedCheckedChangeWifi({
                checked: event.value,
                reason: event.reason ?? "imperative",
              })
            : undefined,
        view: (parts) =>
          h.label
            .attr("data-slot", "label")
            .children(
              "Wi-Fi",
              parts.root(h.button).children(parts.thumb(h.span)),
              parts.input(h.input)
            ),
      })
    ),
})

export { Example }
