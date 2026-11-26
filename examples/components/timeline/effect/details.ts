import * as Html from "@effect/ui/html/Html"
import { Collapsible } from "@ui-sdk/effect/collapsible"
import { Timeline } from "@ui-sdk/effect/timeline"
import * as Schema from "effect/Schema"

const releases = [
  {
    title: "Version 2.4",
    dateTime: "2026-10-28",
    time: "October 28",
    description: "Faster search and resumable uploads.",
    changes: [
      "Search now matches file contents, not only names.",
      "Uploads resume after the connection drops.",
    ],
  },
  {
    title: "Version 2.3",
    dateTime: "2026-09-30",
    time: "September 30",
    description: "Shared links and a new sidebar.",
    changes: [
      "Shared links remember the folder they were opened from.",
      "The sidebar collapses to icons on narrow screens.",
    ],
  },
  {
    title: "Version 2.2",
    dateTime: "2026-08-26",
    time: "August 26",
    description: "Dark mode follows your system.",
    changes: ["Dark mode follows the system setting.", "Avatars are sharper."],
  },
]

const Chevron = <M>(h: Html.H<M>) =>
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
    .children(h.el("path").attr("d", "m6 9 6 6 6-6"))

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
        timeline.root(h.div.attr("aria-label", "Changelog")).children(
          releases.map((release) => {
            const item = timeline.in("item", { value: release.dateTime })
            return timeline
              .item(h.div.key(release.dateTime), { value: release.dateTime })
              .children(
                item.marker(h.div),
                item.connector(h.div),
                item.title(h.div).children(release.title),
                item
                  .time(h.time.attr("datetime", release.dateTime))
                  .children(release.time),
                item.description(h.div).children(release.description),
                Collapsible(h, {
                  key: release.dateTime,
                  view: (collapsible) =>
                    collapsible
                      .root(h.div)
                      .children(
                        collapsible
                          .trigger(h.button)
                          .children("What Changed", Chevron(h)),
                        collapsible.panel(
                          h.div.children(
                            h.ul.children(
                              release.changes.map((change) =>
                                h.li.children(change)
                              )
                            )
                          )
                        )
                      ),
                })
              )
          })
        ),
    }),
})

export { Example }
