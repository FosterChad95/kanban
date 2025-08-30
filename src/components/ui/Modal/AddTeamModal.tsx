import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { AddTeamSchema, AddTeamFormValues } from "../../../schemas/forms";

export type UserOption = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
};

type AddTeamModalProps = {
  users: UserOption[];
  onCreate: (form: {
    teamName: string;
    users: UserOption[];
  }) => void | Promise<void>;
  multiUser?: boolean;
};

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

  // Type guard to ensure only UserOption[]
  const filterUserOptions = (arr: unknown): UserOption[] =>
    Array.isArray(arr)
      ? arr.filter(
          (u): u is UserOption =>
            typeof u === "object" && u !== null && "id" in u && "name" in u
        )
      : [];

  const onSubmit = (data: AddTeamFormValues) => {
    onCreate({
      teamName: data.teamName,
      users: filterUserOptions(data.users ?? []),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#2b2c37] text-black dark:text-light-gray rounded-lg p-8 w-full max-w-md"
      style={{ minWidth: 400 }}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">Add New Team</h2>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Team Name
        </label>
        <TextField
          placeholder="e.g. Product Team"
          {...register("teamName")}
          error={errors.teamName?.message}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Users
        </label>
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
        {errors.users && (
          <span className="text-xs text-red-500">{errors.users.message}</span>
        )}
      </div>
      <Button type="submit" className="w-full" variant="primary-l">
        Create Team
      </Button>
    </form>
  );
};

export default AddTeamModal;
