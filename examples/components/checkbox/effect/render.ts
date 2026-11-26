import * as Html from "@effect/ui/html/Html"
import { Checkbox } from "@ui-sdk/effect/checkbox"
import * as Schema from "effect/Schema"

const topics = [
  { value: "design", label: "Design", checked: true },
  { value: "engineering", label: "Engineering", checked: false },
  { value: "marketing", label: "Marketing", checked: false },
  { value: "sales", label: "Sales", checked: false },
]

const Icon = <M>(h: Html.H<M>, ...paths: string[]) =>
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
    .children(paths.map((d) => h.el("path").attr("d", d)))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.fieldset.children(
      h.legend.children("Topics you follow"),
      h.div.attr("data-slot", "row").children(
        topics.map((topic) =>
          Checkbox(h, {
            key: topic.value,
            props: {
              name: "topics",
              value: topic.value,
              defaultChecked: topic.checked,
            },
            view: (checkbox) =>
              h.span.children(
                checkbox
                  .root(h.button)
                  .children(
                    checkbox.state.checked
                      ? Icon(h, "M20 6 9 17l-5-5")
                      : Icon(h, "M5 12h14", "M12 5v14"),
                    topic.label
                  ),
                checkbox.input(h.input)
              ),
          })
        )
      )
    ),
})

export { Example }
