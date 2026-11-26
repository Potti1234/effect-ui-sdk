import * as Command from "@effect/ui/Command"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Switch } from "@ui-sdk/effect/switch"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedCheckedChangeBackups: { checked: Schema.Boolean },
  CompletedSaveBackups: { checked: Schema.Boolean },
})

const SaveBackups = Command.make(
  "SaveBackups",
  { args: { checked: Schema.Boolean } },
  ({ checked }) =>
    Effect.sleep("800 millis").pipe(
      Effect.as(ExampleMessage.CompletedSaveBackups({ checked }))
    )
)

const Spinner = <M>(h: Html.H<M>) =>
  h
    .el("svg")
    .attrs({
      "data-slot": "spinner",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    })
    .children(h.el("path").attr("d", "M21 12a9 9 0 1 1-6.219-8.56"))

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ checked: Schema.Boolean, saving: Schema.Boolean }),
  message: ExampleMessage,
}).make({
  init: () => ({ checked: false, saving: false }),
  update: {
    RequestedCheckedChangeBackups: ($, { checked }) =>
      $.model.saving
        ? $.model
        : $.evolve({ saving: true })
            .run(log("Saving…"))
            .run(SaveBackups.make({ checked })),
    CompletedSaveBackups: ($, { checked }) =>
      $.evolve({ checked, saving: false }).run(
        log(`Saved: ${checked ? "on" : "off"}`)
      ),
  },
  view: (h, model) =>
    Switch(h, {
      props: { checked: model.checked },
      onEmit: (event) =>
        event._tag === "CheckedChange"
          ? ExampleMessage.RequestedCheckedChangeBackups({
              checked: event.value,
            })
          : undefined,
      view: (parts) =>
        h.label
          .attr("data-slot", "label")
          .children(
            "Automatic backups",
            parts
              .root(h.button.attr("aria-busy", model.saving ? "true" : "false"))
              .children(
                parts.thumb(h.span).children(model.saving && Spinner(h))
              ),
            parts.input(h.input)
          ),
    }),
})

export { Example }
