import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { FormField } from "./FormModal";
import Button from "../Button/Button";
import { AddTeamSchema, AddTeamFormValues } from "../../../schemas/forms";
import { filterUserOptions, MODAL_STYLES } from "./utils";
import type { UserOption, TeamFormData } from "./types";

interface AddTeamModalProps {
  users: UserOption[];
  onCreate: (form: TeamFormData) => void | Promise<void>;
  multiUser?: boolean;
}

const teamResolver = zodResolver(
  AddTeamSchema
) as unknown as Resolver<AddTeamFormValues>;

const AddTeamModal: React.FC<AddTeamModalProps> = ({
  users,
  onCreate,
  multiUser = true,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddTeamFormValues>({
    resolver: teamResolver,
    defaultValues: {
      teamName: "",
      users: [],
    },
  });

  const selectedUsers = watch("users");

  const onSubmit = (data: AddTeamFormValues) => {
    onCreate({
      name: data.teamName, // Map teamName to name for consistency
      users: filterUserOptions(data.users ?? []),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={MODAL_STYLES.form}
      style={MODAL_STYLES.formMinWidth}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className={MODAL_STYLES.heading}>Add New Team</h2>
      </div>

      <FormField
        label="Team Name"
        error={errors.teamName?.message}
        required
      >
        <TextField
          placeholder="e.g. Product Team"
          {...register("teamName")}
          error={errors.teamName?.message}
        />
      </FormField>

      <FormField
        label="Users"
        error={errors.users?.message}
      >
        <Dropdown
          options={users}
          value={selectedUsers}
          onChange={(val) =>
            setValue(
              "users",
              filterUserOptions(Array.isArray(val) ? val : [val]),
              { shouldValidate: true }
            )
          }
          placeholder="Select users"
          multiSelect={multiUser}
        />
      </FormField>

      <Button 
        type="submit" 
        className={MODAL_STYLES.button.full} 
        variant="primary-l"
      >
        Create Team
      </Button>
    </form>
  );
};

export default AddTeamModal;
