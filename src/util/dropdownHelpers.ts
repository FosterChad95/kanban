export type UserOption = {
  id: string;
  name: string;
  avatar?: string;
};

export type DropdownOption = string | UserOption;

/**
 * Returns the unique id for a dropdown option.
 */
export function getOptionId(option: DropdownOption): string {
  return typeof option === "string" ? option : option.id;
}

/**
 * Returns the display label for a dropdown option.
 */
export function getOptionLabel(option: DropdownOption): string {
  return typeof option === "string" ? option : option.name;
}

/**
 * Returns the avatar URL for a dropdown option, if any.
 */
export function getOptionAvatar(option: DropdownOption): string | undefined {
  return typeof option === "string" ? undefined : option.avatar;
}
