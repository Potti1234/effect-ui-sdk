import * as Html from "@effect/ui/html/Html"
import { Checkbox, CheckboxGroup } from "@ui-sdk/effect/checkbox"
import * as Schema from "effect/Schema"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

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
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    CheckboxGroup(h, {
      props: { defaultValue: ["cheese"] },
      view: (group) =>
        h.div.attr("data-slot", "stack").children(
          h.h3.attr("id", "basic-toppings").children("Toppings"),
          group.group(h.div.attr("aria-labelledby", "basic-toppings")).children(
            toppings.map((topping) =>
              Checkbox(h, {
                key: topping.value,
                props: { value: topping.value, group: group.join },
                view: (checkbox) =>
                  h.label
                    .attr("data-slot", "label")
                    .children(
                      checkbox
                        .root(h.button)
                        .children(
                          checkbox.indicator(h.span.children(Check(h)))
                        ),
                      checkbox.input(h.input),
                      topping.label
                    ),
              })
            )
          ),
          group.input(h.input)
        ),
    }),
})

export { Example }
