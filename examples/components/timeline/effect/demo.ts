import * as Html from "@effect/ui/html/Html"
import { Timeline } from "@ui-sdk/effect/timeline"
import * as Schema from "effect/Schema"

const events = [
  {
    title: "Deployed to production",
    dateTime: "2026-11-10T14:32",
    time: "Today, 2:32 PM",
    description: "Version 2.4.1 is live in every region.",
  },
  {
    title: "Checks passed",
    dateTime: "2026-11-10T14:20",
    time: "Today, 2:20 PM",
    description: "312 tests and the bundle size budget.",
  },
  {
    title: "Pull request merged",
    dateTime: "2026-11-10T13:58",
    time: "Today, 1:58 PM",
    description: "Ada merged Cache search results into main.",
  },
  {
    title: "Review requested",
    dateTime: "2026-11-09T17:05",
    time: "Yesterday, 5:05 PM",
    description: "Grace and Linus were asked to review.",
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
    Timeline(h, {
      view: (timeline) =>
        timeline.root(h.div.attr("aria-label", "Activity")).children(
          events.map((event) => {
            const item = timeline.in("item", { value: event.dateTime })
            return timeline
              .item(h.div.key(event.dateTime), { value: event.dateTime })
              .children(
                item.marker(h.div),
                item.connector(h.div),
                item.title(h.div).children(event.title),
                item
                  .time(h.time.attr("datetime", event.dateTime))
                  .children(event.time),
                item.description(h.div).children(event.description)
              )
          })
        ),
    }),
})

export { Example }
