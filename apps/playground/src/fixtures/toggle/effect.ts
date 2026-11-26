import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Button } from "@ui-sdk/effect/button"
import { Separator } from "@ui-sdk/effect/separator"
import {
  Toggle,
  ToggleGroup,
  createToggleGroupController,
} from "@ui-sdk/effect/toggle"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { changedValue, toggleOptions } from "tests/fixtures/page.ts"
import {
  toggleAction,
  toggleFixture,
  type ToggleFixtureItem,
} from "tests/fixtures/toggle.ts"
import { mountFixture } from "../../ssr/effect-mount"

const formatting = createToggleGroupController()

// A Promise and the buttons that settle it.
function createGate() {
  let settle: { resolve: () => void; reject: (reason: Error) => void } | null =
    null
  const gate = {
    current: Promise.resolve(),
    wait: () =>
      (gate.current = new Promise<void>(
        (resolve, reject) => (settle = { resolve, reject })
      )),
    resolve: () => settle?.resolve(),
    reject: () => settle?.reject(new Error("Offline")),
  }
  return gate
}

const saving = createGate()
const publishing = createGate()

const FixtureProps = Schema.Struct({
  orientation: Schema.optional(Schema.Literals(["horizontal", "vertical"])),
  deselectable: Schema.Boolean,
  loop: Schema.Boolean,
  disabled: Schema.Boolean,
  defaultPressed: Schema.Boolean,
  alignment: Schema.NullOr(Schema.String),
  cancel: Schema.NullOr(Schema.String),
})

const FixtureMessage = UiSchema.TaggedEnum({
  RequestedPressedChange: { pressed: Schema.Boolean },
  RequestedValueChange: {
    name: Schema.String,
    value: Schema.Array(Schema.String),
  },
  PressedButton: {
    action: Schema.String,
    source: Schema.optional(Schema.String),
  },
  PressedPublish: {},
  SubmittedForm: {},
  ClickedClearFormatting: {},
  ClickedFinishSaving: {},
  ClickedFinishPublishing: {},
  ClickedFailPublishing: {},
})

const ClearFormatting = Command.make("ClearFormatting", { args: {} }, () =>
  Effect.sync(() => {
    formatting.setValue([])
    return Component.noop
  })
)

const Settle = Command.make(
  "Settle",
  {
    args: {
      gate: Schema.Literals(["saving", "publishing"]),
      ok: Schema.Boolean,
    },
  },
  ({ gate, ok }) =>
    Effect.sync(() => {
      const settling = gate === "saving" ? saving : publishing
      if (ok) {
        settling.resolve()
      } else {
        settling.reject()
      }
      return Component.noop
    })
)

// Publishing reports "published" once the action's Promise resolves.
const AwaitPublishing = Command.make("AwaitPublishing", { args: {} }, () =>
  Effect.promise(() =>
    publishing.current.then(
      () => FixtureMessage.PressedButton({ action: "published" }),
      () => Component.noop
    )
  )
)

const Fixture = Html.component({
  name: "ToggleFixture",
  props: FixtureProps,
  model: Schema.Struct({
    action: Schema.String,
    pressedWith: Schema.String,
    submissions: Schema.Number,
    bookmark: Schema.Boolean,
    alignment: Schema.Array(Schema.String),
    formatting: Schema.Array(Schema.String),
  }),
  message: FixtureMessage,
}).make({
  init: ($) => ({
    action: "",
    pressedWith: "",
    submissions: 0,
    bookmark: $.props.defaultPressed,
    alignment: $.props.alignment
      ? [$.props.alignment]
      : toggleFixture.alignment.defaultValue,
    formatting: toggleFixture.formatting.defaultValue,
  }),
  update: {
    RequestedPressedChange: ($, { pressed }) =>
      $.props.cancel === toggleFixture.toggle.value
        ? $.model
        : $.evolve({ bookmark: pressed, action: toggleAction.toggle(pressed) }),
    RequestedValueChange: ($, { name, value }) => {
      const before =
        name === "alignment" ? $.model.alignment : $.model.formatting
      if ($.props.cancel && changedValue(before, value) === $.props.cancel) {
        return $.model
      }
      return $.evolve({
        [name]: value,
        action: toggleAction.group(name, [...value]),
      })
    },
    PressedButton: ($, { action, source }) =>
      $.evolve({
        action,
        ...(source === undefined ? {} : { pressedWith: source }),
      }),
    PressedPublish: ($) =>
      $.evolve({ action: "publishing" }).run(AwaitPublishing.make({})),
    SubmittedForm: ($) => $.evolve({ submissions: (count) => count + 1 }),
    ClickedClearFormatting: ($) => $.run(ClearFormatting.make({})),
    ClickedFinishSaving: ($) =>
      $.run(Settle.make({ gate: "saving", ok: true })),
    ClickedFinishPublishing: ($) =>
      $.run(Settle.make({ gate: "publishing", ok: true })),
    ClickedFailPublishing: ($) =>
      $.run(Settle.make({ gate: "publishing", ok: false })),
  },
  view: (h, model) => {
    const { cancel, defaultPressed, disabled, alignment, ...groupOptions } =
      h.props
    const group = (
      { name, label, items }: typeof toggleFixture.alignment,
      props: {
        multiple?: boolean
        disabled?: boolean
        controller?: typeof formatting
      }
    ) => {
      const value = name === "alignment" ? model.alignment : model.formatting
      return ToggleGroup(h, {
        key: name,
        props: {
          ...(cancel ? { value } : { defaultValue: value }),
          ...groupOptions,
          ...props,
        },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? FixtureMessage.RequestedValueChange({
                name,
                value: event.value as string[],
              })
            : undefined,
        view: (toggleGroup) =>
          toggleGroup
            .group(h.div.class("toggle-group").attr("aria-label", label))
            .children(
              items.map((item: ToggleFixtureItem) =>
                Toggle(h, {
                  key: `${name}-${item.value}`,
                  props: {
                    value: item.value,
                    disabled: item.disabled,
                    group: toggleGroup.join,
                  },
                  view: (toggle) =>
                    toggle.root(h.button.class("toggle")).children(item.label),
                })
              )
            ),
      })
    }
    return h.div.class("fixture").children(
      h.button.children("Before"),
      Toggle(h, {
        key: toggleFixture.toggle.value,
        props:
          cancel === toggleFixture.toggle.value
            ? { pressed: model.bookmark }
            : { defaultPressed },
        onEmit: (event) =>
          event._tag === "PressedChange"
            ? FixtureMessage.RequestedPressedChange({ pressed: event.value })
            : undefined,
        view: (toggle) =>
          toggle
            .root(h.button.class("toggle"))
            .children(toggleFixture.toggle.label),
      }),
      group(toggleFixture.alignment, {}),
      Separator(h, {
        key: "vertical",
        props: { orientation: "vertical" },
        view: (separator) => separator.root(h.div.class("rule")),
      }),
      group(toggleFixture.formatting, {
        multiple: true,
        disabled,
        controller: formatting,
      }),
      h.form
        .attr("aria-label", toggleFixture.form.label)
        .on("submit", () => FixtureMessage.SubmittedForm())
        .children(
          h.label.children(
            `${toggleFixture.form.field} `,
            h.input.attrs({
              name: "name",
              value: toggleFixture.form.defaultName,
            })
          ),
          Button(h, {
            key: "submit",
            props: { type: "submit", action: saving.wait },
            view: (button) =>
              button.root(h.button.class("button")).children("Submit"),
          }),
          Button(h, {
            key: "reset",
            props: { type: "reset" },
            view: (button) =>
              button.root(h.button.class("button")).children("Reset"),
          }),
          Button(h, {
            key: "delete",
            props: { disabled: true },
            onEmit: () => FixtureMessage.PressedButton({ action: "delete" }),
            view: (button) =>
              button.root(h.button.class("button")).children("Delete"),
          }),
          Button(h, {
            key: "archive",
            props: {
              type: "submit",
              disabled: true,
              focusableWhenDisabled: true,
            },
            onEmit: () => FixtureMessage.PressedButton({ action: "archive" }),
            view: (button) =>
              button.root(h.button.class("button")).children("Archive"),
          })
        ),
      Button(h, {
        key: "save",
        onEmit: ({ source }) =>
          FixtureMessage.PressedButton({ action: "save", source }),
        view: (button) =>
          button.root(h.button.class("button")).children("Save"),
      }),
      Button(h, {
        key: "publish",
        props: { action: publishing.wait },
        onEmit: () => FixtureMessage.PressedPublish(),
        view: (button) =>
          button.root(h.button.class("button")).children("Publish"),
      }),
      h.button
        .key("clear")
        .on("click", FixtureMessage.ClickedClearFormatting())
        .children("Clear formatting"),
      h.button
        .key("finish-saving")
        .on("click", FixtureMessage.ClickedFinishSaving())
        .children("Finish saving"),
      h.button
        .key("finish-publishing")
        .on("click", FixtureMessage.ClickedFinishPublishing())
        .children("Finish publishing"),
      h.button
        .key("fail-publishing")
        .on("click", FixtureMessage.ClickedFailPublishing())
        .children("Fail publishing"),
      Button(h, {
        key: "docs",
        view: (button) =>
          button
            .root(h.a.class("button").attr("href", toggleFixture.docs.href))
            .children(toggleFixture.docs.label),
      }),
      Button(h, {
        key: "changelog",
        props: { disabled: true },
        view: (button) =>
          button
            .root(
              h.a.class("button").attr("href", toggleFixture.changelog.href)
            )
            .children(toggleFixture.changelog.label),
      }),
      Separator(h, {
        key: "horizontal",
        view: (separator) => separator.root(h.div.class("rule")),
      }),
      Separator(h, {
        key: "decorative",
        props: { decorative: true },
        view: (separator) => separator.root(h.div.class("rule")),
      }),
      h.button.key("after").children("After"),
      h.output
        .key("action")
        .attrs({ role: "status", "aria-label": "Last action" })
        .children(model.action),
      h.output
        .key("submissions")
        .attr("aria-label", "Submissions")
        .children(String(model.submissions)),
      h.output
        .key("pressed-with")
        .attr("aria-label", "Pressed with")
        .children(model.pressedWith)
    )
  },
})

const props = () => {
  const { orientation, ...options } = toggleOptions()
  return { ...options, ...(orientation ? { orientation } : {}) }
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
