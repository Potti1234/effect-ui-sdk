import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const options = [
  {
    value: "all",
    label: "Everything",
    description: "Every message and update.",
  },
  {
    value: "mentions",
    label: "Mentions",
    description: "Only when someone mentions you.",
  },
  { value: "none", label: "Nothing", description: "Turn notifications off." },
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
          field.label(h.label).children("Notify me about"),
          RadioGroup(h, {
            props: { defaultValue: "mentions" },
            view: (radioGroup) =>
              field.control(radioGroup.group(h.div)).children(
                options.flatMap((option) => {
                  const radio = radioGroup.radio.state({ value: option.value })
                  return [
                    radioGroup
                      .radio(
                        h.button.attrs({
                          "aria-labelledby": `notify-${option.value}-label`,
                          "aria-describedby": `notify-${option.value}-description`,
                        }),
                        { value: option.value }
                      )
                      .children(
                        h.span.attr("data-slot", "stack").children(
                          h.span
                            .attr("id", `notify-${option.value}-label`)
                            .children(option.label),
                          h.span
                            .attrs({
                              "data-slot": "hint",
                              id: `notify-${option.value}-description`,
                            })
                            .children(option.description)
                        ),
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
                            "data-checked": radio.checked ? "" : undefined,
                          })
                          .children(h.el("path").attr("d", "M20 6 9 17l-5-5"))
                      ),
                    radioGroup.input(h.input, { value: option.value }),
                  ]
                })
              ),
          })
        ),
    }),
})

export { Example }
