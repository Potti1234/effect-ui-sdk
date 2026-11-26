import * as Html from "@effect/ui/html/Html"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
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
          field.label(h.label).children("Theme"),
          RadioGroup(h, {
            props: { defaultValue: "system" },
            view: (radioGroup) =>
              field.control(radioGroup.group(h.div)).children(
                themes.map((theme) =>
                  h.label
                    .key(theme.value)
                    .attr("data-slot", "label")
                    .children(
                      radioGroup
                        .radio(h.button, { value: theme.value })
                        .children(
                          radioGroup
                            .in("radio", { value: theme.value })
                            .indicator(h.span, { keepMounted: true })
                        ),
                      radioGroup.input(h.input, { value: theme.value }),
                      theme.label
                    )
                )
              ),
          })
        ),
    }),
})

export { Example }
