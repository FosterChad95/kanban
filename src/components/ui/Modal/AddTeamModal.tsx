import React from "react";
import { useForm } from "react-hook-form";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";

type UserOption = {
  id: string;
  name: string;
  avatar?: string;
};

type AddTeamModalProps = {
  users: UserOption[]; // Array of user objects
  onCreate: (form: { teamName: string; users: UserOption[] }) => void;
  multiUser?: boolean; // Allow multiple users to be added
};

type FormValues = {
  teamName: string;
  users: UserOption[]; // Always array for consistency
};

const AddTeamModal: React.FC<AddTeamModalProps> = ({ users, onCreate }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
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

  const onSubmit = (data: FormValues) => {
    onCreate({
      teamName: data.teamName,
      users: filterUserOptions(data.users),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#2b2c37] rounded-lg p-8 w-full max-w-md"
      style={{ minWidth: 400 }}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">Add New Team</h2>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">Team Name</label>
        <TextField
          placeholder="e.g. Product Team"
          {...register("teamName", { required: "Team name is required" })}
          error={errors.teamName?.message}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">Users</label>
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
          multiSelect={true}
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
