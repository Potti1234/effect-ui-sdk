import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const orientations = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
] as const

const Orientation = Schema.Literals(["horizontal", "vertical"])

const ExampleMessage = UiSchema.TaggedEnum({
  ClickedOrientation: { orientation: Orientation },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ orientation: Orientation }),
  message: ExampleMessage,
}).make({
  init: () => ({ orientation: "horizontal" as const }),
  update: {
    ClickedOrientation: ($, { orientation }) => $.evolve({ orientation }),
  },
  view: (h, model) =>
    h.div.children(
      h.div
        .attrs({
          "data-slot": "controls",
          role: "group",
          "aria-label": "Orientation",
        })
        .children(
          orientations.map((option) =>
            h.button
              .key(option.value)
              .attrs({
                type: "button",
                "data-size": "sm",
                "aria-pressed":
                  model.orientation === option.value ? "true" : "false",
              })
              .on(
                "click",
                ExampleMessage.ClickedOrientation({
                  orientation: option.value,
                })
              )
              .children(option.label)
          )
        ),
      Tabs(h, {
        props: { defaultValue: "music", orientation: model.orientation },
        view: (tabs) =>
          tabs
            .root(h.div)
            .children(
              tabs
                .list(h.div.attr("aria-label", "Library"))
                .children(
                  tabs.tab(h.button, { value: "music" }).children("Music"),
                  tabs
                    .tab(h.button, { value: "podcasts" })
                    .children("Podcasts"),
                  tabs
                    .tab(h.button, { value: "audiobooks" })
                    .children("Audiobooks"),
                  tabs.indicator(h.span)
                ),
              tabs.panel(
                h.div.children(
                  "312 songs in 24 albums, synced to this device."
                ),
                { value: "music" }
              ),
              tabs.panel(
                h.div.children("8 shows you follow, with 3 new episodes."),
                { value: "podcasts" }
              ),
              tabs.panel(
                h.div.children("2 books in progress, 6 hours left in total."),
                { value: "audiobooks" }
              )
            ),
      })
    ),
})

export { Example }
