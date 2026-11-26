import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const groups = [
  {
    label: "Theme",
    description: "Set by your organization.",
    props: { defaultValue: "light", disabled: true },
    options: [
      { value: "light", label: "Light", disabled: false },
      { value: "dark", label: "Dark", disabled: false },
      { value: "system", label: "System", disabled: false },
    ],
  },
  {
    label: "Backups",
    description: "Hourly backups need the Pro plan.",
    props: { defaultValue: "daily" },
    options: [
      { value: "hourly", label: "Hourly", disabled: true },
      { value: "daily", label: "Daily", disabled: false },
      { value: "weekly", label: "Weekly", disabled: false },
    ],
  },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("data-slot", "stack").children(
      groups.map((group) =>
        Field(h, {
          key: group.label,
          view: (field) =>
            field.root(h.div).children(
              field.label(h.label).children(group.label),
              field.description(h.p).children(group.description),
              RadioGroup(h, {
                props: group.props,
                view: (radioGroup) =>
                  field.control(radioGroup.group(h.div)).children(
                    group.options.map((option) =>
                      h.label
                        .key(option.value)
                        .attr("data-slot", "label")
                        .children(
                          radioGroup
                            .radio(h.button, {
                              value: option.value,
                              disabled: option.disabled,
                            })
                            .children(
                              radioGroup
                                .in("radio", { value: option.value })
                                .indicator(h.span)
                            ),
                          radioGroup.input(h.input, {
                            value: option.value,
                            disabled: option.disabled,
                          }),
                          option.label
                        )
                    )
                  ),
              })
            ),
        })
      )
    ),
})

export { Example }
