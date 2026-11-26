import * as Html from "@effect/ui/html/Html"
import { FieldSet } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const periods = [
  { value: "monthly", label: "Monthly", price: "$12 per month" },
  { value: "yearly", label: "Yearly", price: "$120 per year" },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    FieldSet(h, {
      view: (fieldSet) =>
        fieldSet.set(h.fieldset).children(
          fieldSet
            .legend(h.legend.attr("id", "billing-legend"))
            .children("Billing period"),
          fieldSet
            .description(h.p.attr("id", "billing-description"))
            .children("Yearly billing gets you two months free."),
          RadioGroup(h, {
            props: { defaultValue: "monthly" },
            view: (radioGroup) =>
              radioGroup
                .group(
                  h.div.attrs({
                    "aria-labelledby": "billing-legend",
                    "aria-describedby": "billing-description",
                  })
                )
                .children(
                  periods.map((period) =>
                    h.label
                      .key(period.value)
                      .attr("data-slot", "label")
                      .children(
                        radioGroup
                          .radio(h.button, { value: period.value })
                          .children(
                            radioGroup
                              .in("radio", { value: period.value })
                              .indicator(h.span)
                          ),
                        radioGroup.input(h.input, { value: period.value }),
                        period.label,
                        h.span
                          .attr("data-slot", "hint")
                          .children(`(${period.price})`)
                      )
                  )
                ),
          })
        ),
    }),
})

export { Example }
