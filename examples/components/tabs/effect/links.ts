import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const pages = [
  {
    value: "overview",
    href: "#project-overview",
    label: "Overview",
    content:
      "Hollis Grant started this project in March. It has 14 open issues.",
  },
  {
    value: "activity",
    href: "#project-activity",
    label: "Activity",
    content:
      "Wren Takahashi merged 3 pull requests and closed 5 issues this week.",
  },
  {
    value: "members",
    href: "#project-members",
    label: "Members",
    content:
      "Hollis Grant owns the project. Wren Takahashi and 3 others can edit it.",
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
      props: { defaultValue: "overview" },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs.list(h.div.attr("aria-label", "Project")).children(
            pages.map((page) =>
              tabs
                .tab(h.a.key(page.value).attr("href", page.href), {
                  value: page.value,
                })
                .children(page.label)
            ),
            tabs.indicator(h.span)
          ),
          pages.map((page) =>
            tabs.panel(h.div.key(page.value).children(page.content), {
              value: page.value,
            })
          )
        ),
    }),
})

export { Example }
