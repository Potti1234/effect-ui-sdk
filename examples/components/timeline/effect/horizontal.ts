import * as Html from "@effect/ui/html/Html"
import { Timeline } from "@ui-sdk/effect/timeline"
import * as Schema from "effect/Schema"

const milestones = [
  { title: "Kickoff", dateTime: "2026-01", time: "January" },
  { title: "Design review", dateTime: "2026-03", time: "March" },
  { title: "Beta", dateTime: "2026-06", time: "June" },
  { title: "Launch", dateTime: "2026-09", time: "September" },
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
      props: { orientation: "horizontal", loop: false },
      view: (timeline) =>
        timeline.root(h.div.attr("aria-label", "Roadmap")).children(
          milestones.map((milestone) => {
            const item = timeline.in("item", { value: milestone.dateTime })
            return timeline
              .item(h.div.key(milestone.dateTime), {
                value: milestone.dateTime,
              })
              .children(
                item.marker(h.div),
                item.connector(h.div),
                item.title(h.div).children(milestone.title),
                item
                  .time(h.time.attr("datetime", milestone.dateTime))
                  .children(milestone.time)
              )
          })
        ),
    }),
})

export { Example }
