import * as Html from "@effect/ui/html/Html"
import { Toggle, ToggleGroup } from "@ui-sdk/effect/toggle"
import * as Schema from "effect/Schema"

const views = [
  { value: "list", label: "قائمة" },
  { value: "grid", label: "شبكة" },
  { value: "cards", label: "بطاقات" },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("dir", "rtl").children(
      ToggleGroup(h, {
        props: { defaultValue: ["list"] },
        view: (group) =>
          group.group(h.div.attr("aria-label", "العرض")).children(
            views.map((item) =>
              Toggle(h, {
                key: item.value,
                props: { value: item.value, group: group.join },
                view: (toggle) => toggle.root(h.button).children(item.label),
              })
            )
          ),
      })
    ),
})

export { Example }
