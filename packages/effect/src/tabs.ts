import { tabs } from "@ui-sdk/core/tabs"
import { createParts } from "./create-parts"

/**
 * Layered sections of content, one shown at a time. Its `view` gets the
 * `root`, the `list` of tabs, each `tab` and its `tabIcon`, the `indicator`
 * that marks the selected tab, and each tab's `panel`, shown while that tab
 * is selected.
 * @stable
 */
const Tabs = createParts(tabs, {
  name: "Tabs",
  tags: {
    root: "div",
    list: "div",
    tab: "button",
    "tab-icon": "span",
    indicator: "span",
    panel: "div",
  },
  present: ["panel"],
})

export { createTabsController } from "@ui-sdk/core/tabs"
export type {
  TabsApi,
  TabsChangeOptions,
  TabsController,
  TabsDirection,
  TabsIndicatorProps,
  TabsIndicatorState,
  TabsListState,
  TabsOptions,
  TabsOrientation,
  TabsPanelProps,
  TabsPanelState,
  TabsPrimitive,
  TabsState,
  TabsTabIconProps,
  TabsTabIconState,
  TabsTabProps,
  TabsTabState,
  TabsValueChangeReason,
} from "@ui-sdk/core/tabs"

export { Tabs }
