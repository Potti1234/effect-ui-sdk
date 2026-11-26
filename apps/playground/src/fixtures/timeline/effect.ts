import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { createTimelineController, Timeline } from "@ui-sdk/effect/timeline"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import {
  advance,
  timelineFixture as f,
  timelineOptions,
} from "tests/fixtures/timeline.ts"
import { mountFixture } from "../../ssr/effect-mount"

const controller = createTimelineController()

const Status = Schema.Literals(["complete", "current", "upcoming"])

const Event = Schema.Struct({
  value: Schema.String,
  title: Schema.String,
  dateTime: Schema.String,
  time: Schema.String,
  description: Schema.String,
  status: Status,
  link: Schema.optional(
    Schema.Struct({ label: Schema.String, href: Schema.String })
  ),
})

const FixtureProps = Schema.Struct({
  orientation: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  loop: Schema.optional(Schema.Boolean),
  feed: Schema.optional(Schema.Boolean),
  busy: Schema.optional(Schema.Boolean),
})

const FixtureMessage = UiSchema.TaggedEnum({
  ClickedAddEvent: {},
  ClickedReverse: {},
  ClickedFocusCurrent: {},
  ClickedAdvance: {},
})

const FocusCurrent = Command.make("FocusCurrent", { args: {} }, () =>
  Effect.sync(() => {
    controller.focus("shipped")
    return Component.noop
  })
)

const Fixture = Html.component({
  name: "TimelineFixture",
  props: FixtureProps,
  model: Schema.Struct({ events: Schema.Array(Event) }),
  message: FixtureMessage,
}).make({
  init: () => ({ events: f.events }),
  update: {
    ClickedAddEvent: ($) =>
      $.evolve({ events: (events) => [f.added, ...events] }),
    ClickedReverse: ($) =>
      $.evolve({ events: (events) => [...events].reverse() }),
    ClickedFocusCurrent: ($) => $.run(FocusCurrent.make({})),
    ClickedAdvance: ($) => $.evolve({ events: (events) => advance(events) }),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Timeline(h, {
        props: { ...h.props, controller },
        view: (timeline) =>
          timeline
            .root(h.div.class("timeline").attr("aria-label", f.label))
            .children(
              model.events.map((event) => {
                const parts = timeline.in("item", {
                  value: event.value,
                  status: event.status,
                })
                return timeline
                  .item(h.div.key(event.value), {
                    value: event.value,
                    status: event.status,
                  })
                  .children(
                    parts.marker(h.div),
                    parts.connector(h.div),
                    parts.title(h.div).children(event.title),
                    parts
                      .time(h.time.attr("datetime", event.dateTime))
                      .children(event.time),
                    parts.description(h.div).children(event.description),
                    event.link &&
                      h.a
                        .attr("href", event.link.href)
                        .children(event.link.label)
                  )
              })
            ),
      }),
      h.button.children("After"),
      h.button
        .on("click", FixtureMessage.ClickedAddEvent())
        .children("Add Event"),
      h.button.on("click", FixtureMessage.ClickedReverse()).children("Reverse"),
      h.button
        .on("click", FixtureMessage.ClickedFocusCurrent())
        .children("Focus Current"),
      h.button.on("click", FixtureMessage.ClickedAdvance()).children("Advance")
    ),
})

const props = () => timelineOptions()

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
