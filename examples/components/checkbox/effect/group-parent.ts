import * as Html from "@effect/ui/html/Html"
import { Checkbox, CheckboxGroup } from "@ui-sdk/effect/checkbox"
import * as Schema from "effect/Schema"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

const Icon = <M>(h: Html.H<M>, d: string) =>
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
    .children(h.el("path").attr("d", d))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    CheckboxGroup(h, {
      props: {
        defaultValue: ["cheese", "olives"],
        allValues: toppings.map((topping) => topping.value),
      },
      view: (group) =>
        h.div.attr("data-slot", "stack").children(
          h.h3.attr("id", "parent-toppings").children("Toppings"),
          group
            .group(h.div.attr("aria-labelledby", "parent-toppings"))
            .children(
              Checkbox(h, {
                key: "parent",
                props: { parent: true, group: group.join },
                view: (checkbox) =>
                  h.label
                    .attr("data-slot", "label")
                    .children(
                      checkbox
                        .root(h.button)
                        .children(
                          checkbox.indicator(
                            h.span.children(
                              Icon(h, "M20 6 9 17l-5-5"),
                              Icon(h, "M5 12h14")
                            )
                          )
                        ),
                      checkbox.input(h.input),
                      "Select all"
                    ),
              }),
              h.div.attr("data-slot", "stack").children(
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
                              checkbox.indicator(
                                h.span.children(Icon(h, "M20 6 9 17l-5-5"))
                              )
                            ),
                          checkbox.input(h.input),
                          topping.label
                        ),
                  })
                )
              )
            ),
          group.input(h.input)
        ),
    }),
})

export { Example }
