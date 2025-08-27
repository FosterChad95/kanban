import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { AddTeamSchema, AddTeamFormValues } from "../../../schemas/forms";
import { UserOption } from "./AddTeamModal";
import Modal from "./Modal";

type EditTeamModalProps = {
  initialTeamName: string;
  initialUsers: UserOption[];
  users: UserOption[];
  onEdit: (form: { teamName: string; users: UserOption[] }) => void;
  multiUser?: boolean;
  isOpen: boolean;
  onClose: () => void;
};

const teamResolver = zodResolver(
  AddTeamSchema
) as unknown as Resolver<AddTeamFormValues>;

const EditTeamModal: React.FC<EditTeamModalProps> = ({
  initialTeamName,
  initialUsers,
  users,
  onEdit,
  multiUser = true,
  isOpen,
  onClose,
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
      teamName: initialTeamName,
      users: initialUsers,
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
    onEdit({
      teamName: data.teamName,
      users: filterUserOptions(data.users ?? []),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-[#2b2c37] rounded-lg p-8 w-full max-w-md"
        style={{ minWidth: 400 }}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">Edit Team</h2>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">Team Name</label>
          <TextField
            placeholder="e.g. Product Team"
            {...register("teamName")}
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
            multiSelect={multiUser}
          />
          {errors.users && (
            <span className="text-xs text-red-500">{errors.users.message}</span>
          )}
        </div>
        <Button type="submit" className="w-full" variant="primary-l">
          Save Changes
        </Button>
      </form>
    </Modal>
  );
};

export default EditTeamModal;
