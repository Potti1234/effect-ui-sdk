import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const ranges = [
  {
    value: "day",
    label: "Day",
    content: "128 visitors today, up 12% from yesterday.",
  },
  {
    value: "week",
    label: "Week",
    content: "1,024 visitors this week, up 8% from last week.",
  },
  {
    value: "month",
    label: "Month",
    content: "4,210 visitors this month, down 3% from last month.",
  },
  {
    value: "year",
    label: "Year",
    content: "48,930 visitors this year, up 21% from last year.",
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
    Tabs(h, {
      props: { defaultValue: "day", loop: false },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs
            .list(h.div.attr("aria-label", "Range"))
            .children(
              ranges.map((range) =>
                tabs
                  .tab(h.button.key(range.value), { value: range.value })
                  .children(range.label)
              )
            ),
          ranges.map((range) =>
            tabs.panel(h.div.key(range.value).children(range.content), {
              value: range.value,
            })
          )
        ),
    }),
})

export { Example }
