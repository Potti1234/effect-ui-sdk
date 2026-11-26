import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("dir", "rtl").children(
      Tabs(h, {
        props: { defaultValue: "account" },
        view: (tabs) =>
          tabs.root(h.div).children(
            tabs
              .list(h.div.attr("aria-label", "الإعدادات"))
              .children(
                tabs.tab(h.button, { value: "account" }).children("الحساب"),
                tabs
                  .tab(h.button, { value: "password" })
                  .children("كلمة المرور"),
                tabs
                  .tab(h.button, { value: "notifications" })
                  .children("الإشعارات"),
                tabs.indicator(h.span)
              ),
            tabs.panel(h.div.children("عدّل اسمك وبريدك الإلكتروني وصورتك."), {
              value: "account",
            }),
            tabs.panel(
              h.div.children("غيّر كلمة المرور وفعّل التحقق بخطوتين."),
              { value: "password" }
            ),
            tabs.panel(h.div.children("اختر ما نرسله إليك بالبريد."), {
              value: "notifications",
            })
          ),
      })
    ),
})

export { Example }
