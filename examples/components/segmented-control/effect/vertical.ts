import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { SegmentedControl } from "@ui-sdk/effect/segmented-control"
import * as Schema from "effect/Schema"

const items = [
  { value: "top", label: "Top" },
  { value: "middle", label: "Middle" },
  { value: "bottom", label: "Bottom" },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Field(h, {
      view: (field) =>
        field.root(h.div).children(
          field.label(h.label).children("Vertical alignment"),
          SegmentedControl(h, {
            props: { orientation: "vertical", defaultValue: "middle" },
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
          })
        ),
    }),
})

export { Example }
