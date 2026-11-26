import * as Command from "@effect/ui/Command"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Timeline } from "@ui-sdk/effect/timeline"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const updates = [
  {
    id: 1,
    author: "Ada",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Shipped the new onboarding flow.",
  },
  {
    id: 2,
    author: "Grace",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Fixed the flaky upload test.",
  },
  {
    id: 3,
    author: "Linus",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Moved the docs to the new theme.",
  },
  {
    id: 4,
    author: "Margaret",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Wrote the launch checklist.",
  },
  {
    id: 5,
    author: "Ada",
    date: "2026-11-08",
    time: "Nov 8",
    text: "Cut search latency in half.",
  },
  {
    id: 6,
    author: "Grace",
    date: "2026-11-07",
    time: "Nov 7",
    text: "Added keyboard shortcuts to the editor.",
  },
  {
    id: 7,
    author: "Linus",
    date: "2026-11-06",
    time: "Nov 6",
    text: "Cleaned up the old billing code.",
  },
  {
    id: 8,
    author: "Margaret",
    date: "2026-11-05",
    time: "Nov 5",
    text: "Ran the accessibility review.",
  },
  {
    id: 9,
    author: "Ada",
    date: "2026-11-04",
    time: "Nov 4",
    text: "Started the mobile layout.",
  },
]

const pageSize = 3

const ExampleMessage = UiSchema.TaggedEnum({
  ClickedLoadMore: {},
  LoadedMore: {},
})

const LoadMore = Command.make("LoadMore", { args: {} }, () =>
  Effect.sleep("600 millis").pipe(Effect.as(ExampleMessage.LoadedMore()))
)

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ count: Schema.Number, busy: Schema.Boolean }),
  message: ExampleMessage,
}).make({
  init: () => ({ count: pageSize, busy: false }),
  update: {
    ClickedLoadMore: ($) => $.evolve({ busy: true }).run(LoadMore.make({})),
    LoadedMore: ($) =>
      $.evolve({ count: (count) => count + pageSize, busy: false }).run(
        log(`Loaded ${pageSize} more updates`)
      ),
  },
  view: (h, model) =>
    h.div.attr("data-slot", "stack").children(
      h.div.attr("data-slot", "controls").children(
        h.button
          .attrs({
            disabled:
              model.busy || model.count >= updates.length ? "" : undefined,
          })
          .on("click", ExampleMessage.ClickedLoadMore())
          .children(model.busy ? "Loading…" : "Load More")
      ),
      Timeline(h, {
        props: { feed: true, busy: model.busy },
        view: (timeline) =>
          timeline.root(h.div.attr("aria-label", "Team updates")).children(
            updates.slice(0, model.count).map((update) => {
              const value = String(update.id)
              const item = timeline.in("item", { value })
              return timeline
                .item(h.div.key(value), { value })
                .children(
                  item.marker(h.div),
                  item.connector(h.div),
                  item.title(h.div).children(update.author),
                  item
                    .time(h.time.attr("datetime", update.date))
                    .children(update.time),
                  item.description(h.div).children(update.text)
                )
            })
          ),
      })
    ),
})

export { Example }
