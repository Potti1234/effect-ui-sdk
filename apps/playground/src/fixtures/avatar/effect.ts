import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Avatar } from "@ui-sdk/effect/avatar"
import * as Schema from "effect/Schema"
import {
  avatarAction,
  avatarFixture,
  type AvatarFixtureItem,
} from "tests/fixtures/avatar.ts"
import { mountFixture } from "../../ssr/effect-mount"

const [first, ...rest] = avatarFixture.items

const FixtureMessage = UiSchema.TaggedEnum({
  ChangedLoadingStatus: { status: Schema.String, reason: Schema.String },
  ClickedChangeImage: {},
  ClickedRemoveImage: {},
  ClickedRemount: {},
})

const Fixture = Html.component({
  name: "AvatarFixture",
  model: Schema.Struct({
    action: Schema.String,
    src: Schema.optional(Schema.String),
    mounts: Schema.Number,
  }),
  message: FixtureMessage,
}).make({
  init: () => ({ action: "", src: first.src, mounts: 0 }),
  update: {
    ChangedLoadingStatus: ($, { status, reason }) =>
      $.evolve({ action: avatarAction(status, reason) }),
    ClickedChangeImage: ($) => $.evolve({ src: avatarFixture.nextSrc }),
    ClickedRemoveImage: ($) => $.evolve({ src: undefined }),
    ClickedRemount: ($) => $.evolve({ mounts: (count) => count + 1 }),
  },
  view: (h, model) => {
    const avatar = (key: string, item: AvatarFixtureItem, reports = false) =>
      Avatar(h, {
        key,
        ...(reports && {
          onEmit: {
            LoadingStatusChange: ({ value, reason }) =>
              FixtureMessage.ChangedLoadingStatus({
                status: value,
                reason: reason ?? "",
              }),
          },
        }),
        view: (parts) =>
          parts.root(h.span.class("avatar")).children(
            item.src !== undefined &&
              parts.image(
                h.img.class("avatar-image").attrs({
                  src: item.src,
                  alt: item.name,
                  referrerpolicy: item.referrerPolicy,
                  crossorigin: item.crossOrigin,
                })
              ),
            parts.fallback(
              h.span.class("avatar-fallback").children(item.initials),
              { delay: item.delay }
            )
          ),
      })
    return h.div.class("fixture").children(
      h.button.children("Before"),
      avatar(`first-${model.mounts}`, { ...first, src: model.src }, true),
      rest.map((item) => avatar(item.name, item)),
      h.button
        .key("change")
        .on("click", FixtureMessage.ClickedChangeImage())
        .children("Change image"),
      h.button
        .key("remove")
        .on("click", FixtureMessage.ClickedRemoveImage())
        .children("Remove image"),
      h.button
        .key("remount")
        .on("click", FixtureMessage.ClickedRemount())
        .children("Remount"),
      h.button.key("after").children("After"),
      h.output
        .key("action")
        .attrs({ role: "status", "aria-label": "Last action" })
        .children(model.action)
    )
  },
})

const props = () => ({})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
