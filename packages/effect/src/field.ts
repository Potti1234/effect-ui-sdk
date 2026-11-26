import { field, fieldGroup, fieldSet } from "@ui-sdk/core/field"
import { createParts } from "./create-parts"

/**
 * Ties a form control to its label, description and error messages. Its
 * `view` gets the `root`, `label`, `description`, `error` and `control`
 * parts. Apply `control` to the control's own element, like a native input
 * or a checkbox's root: `field.control(checkbox.root(h.button))`.
 * @stable
 */
const Field = createParts(field, {
  name: "Field",
  tags: {
    root: "div",
    label: "label",
    description: "p",
    error: "p",
    control: "input",
  },
  present: ["error"],
  content: { error: (state: { message: string }) => state.message },
})

/**
 * Groups related fields under one legend, like the parts of an address. Its
 * `view` gets the `set`, `legend` and `description` parts.
 * @stable
 */
const FieldSet = createParts(fieldSet, {
  name: "FieldSet",
  tags: { set: "fieldset", legend: "legend", description: "p" },
  state: "set",
})

/**
 * Lays out fields side by side, like a first and a last name. Its `view`
 * gets the `group` part.
 * @stable
 */
const FieldGroup = createParts(fieldGroup, {
  name: "FieldGroup",
  tags: { group: "div" },
  state: "group",
})

export type {
  FieldApi,
  FieldDescriptionState,
  FieldErrorProps,
  FieldErrorState,
  FieldGroupPrimitive,
  FieldOptions,
  FieldPrimitive,
  FieldSetOptions,
  FieldSetPrimitive,
  FieldSetState,
  FieldState,
  ValidityKey,
} from "@ui-sdk/core/field"

export { Field, FieldGroup, FieldSet }
