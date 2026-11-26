import { timeline } from "@ui-sdk/core/timeline"
import { createParts } from "./create-parts"

/**
 * A list of dated events, like an activity feed or an order's history, with
 * one tab stop and arrow keys between events. `feed` makes it a feed of
 * articles that loads more as people scroll. Its `view` gets the `root` and
 * each `item`; `timeline.in("item", { value, status })` gives the `marker`,
 * `connector`, `time`, `title` and `description` of one event.
 * @experimental
 */
const Timeline = createParts(timeline, {
  name: "Timeline",
  tags: {
    root: "div",
    item: "div",
    marker: "div",
    connector: "div",
    time: "time",
    title: "div",
    description: "div",
  },
})

export { createTimelineController } from "@ui-sdk/core/timeline"
export type {
  TimelineApi,
  TimelineConnectorState,
  TimelineController,
  TimelineDescriptionState,
  TimelineItemProps,
  TimelineItemState,
  TimelineMarkerState,
  TimelineOptions,
  TimelineOrientation,
  TimelinePrimitive,
  TimelineState,
  TimelineStatus,
  TimelineTimeState,
  TimelineTitleState,
} from "@ui-sdk/core/timeline"

export { Timeline }
