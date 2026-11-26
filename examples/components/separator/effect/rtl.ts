import * as Html from "@effect/ui/html/Html"
import { Separator } from "@ui-sdk/effect/separator"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attrs({ "data-slot": "stack", dir: "rtl" }).children(
      h.div
        .attr("data-slot", "stack")
        .children(
          h.h3.children("الحساب"),
          h.p.attr("data-slot", "hint").children("إدارة ملفك الشخصي وتفضيلاتك.")
        ),
      Separator(h, { view: (separator) => separator.root(h.div) }),
      h.div.attr("data-slot", "row").children(
        h.span.children("الملف الشخصي"),
        Separator(h, {
          props: { orientation: "vertical" },
          view: (separator) => separator.root(h.div),
        }),
        h.span.children("الفوترة"),
        Separator(h, {
          props: { orientation: "vertical" },
          view: (separator) => separator.root(h.div),
        }),
        h.span.children("الإعدادات")
      )
    ),
})

export { Example }
