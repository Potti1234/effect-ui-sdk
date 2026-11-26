import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { SegmentedControl } from "@ui-sdk/effect/segmented-control"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

type Item = { value: string; label: string }

const themes: Item[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const densities: Item[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
]

const ExampleMessage = UiSchema.TaggedEnum({
  SubmittedForm: {
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    SubmittedForm: ($, { entries }) => {
      const data = new Map(entries)
      return $.set(null).run(
        log(`Saved theme=${data.get("theme")}, density=${data.get("density")}`)
      )
    },
  },
  view: (h) => {
    const control = (
      label: string,
      props: { name: string; defaultValue: string; required?: boolean },
      items: Item[],
      description?: string
    ) =>
      Field(h, {
        key: props.name,
        view: (field) =>
          field.root(h.div).children(
            field.label(h.label).children(label),
            SegmentedControl(h, {
              props,
              view: (control) =>
                field.control(control.root(h.div)).children(
                  control.indicator(h.span),
                  items.flatMap((item) => [
                    control
                      .item(h.button.key(item.value), { value: item.value })
                      .children(item.label),
                    control.input(h.input.key(`${item.value}-input`), {
                      value: item.value,
                    }),
                  ])
                ),
            }),
            description && field.description(h.p).children(description)
          ),
      })
    return h.form
      .attr("data-slot", "stack")
      .on("submit", ({ entries }) => ExampleMessage.SubmittedForm({ entries }))
      .children(
        control(
          "Theme",
          { name: "theme", required: true, defaultValue: "system" },
          themes,
          "System follows your device's setting."
        ),
        control(
          "Density",
          { name: "density", defaultValue: "comfortable" },
          densities
        ),
        h.div
          .attr("data-slot", "row")
          .children(
            h.button
              .attrs({ type: "submit", "data-variant": "solid" })
              .children("Save"),
            h.button.attr("type", "reset").children("Reset")
          )
      )
  },
})

export { Example }
