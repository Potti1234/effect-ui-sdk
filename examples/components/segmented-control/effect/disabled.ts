import * as Html from "@effect/ui/html/Html"
import { SegmentedControl } from "@ui-sdk/effect/segmented-control"
import * as Schema from "effect/Schema"

type Item = { value: string; label: string; disabled?: boolean }

const themes: Item[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const periods: Item[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "lifetime", label: "Lifetime", disabled: true },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) => {
    const control = (
      key: string,
      label: string,
      props: { defaultValue: string; disabled?: boolean },
      items: Item[]
    ) =>
      SegmentedControl(h, {
        key,
        props,
        view: (control) =>
          control.root(h.div.attr("aria-label", label)).children(
            control.indicator(h.span),
            items.flatMap((item) => [
              control
                .item(h.button.key(item.value), {
                  value: item.value,
                  disabled: item.disabled,
                })
                .children(item.label),
              control.input(h.input.key(`${item.value}-input`), {
                value: item.value,
                disabled: item.disabled,
              }),
            ])
          ),
      })
    return h.div
      .attr("data-slot", "stack")
      .children(
        control(
          "theme",
          "Theme",
          { defaultValue: "system", disabled: true },
          themes
        ),
        control(
          "billing",
          "Billing period",
          { defaultValue: "monthly" },
          periods
        )
      )
  },
})

export { Example }
