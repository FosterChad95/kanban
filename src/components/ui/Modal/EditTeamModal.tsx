import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { FormModal, FormField } from "./FormModal";
import { EditTeamSchema, EditTeamFormValues } from "../../../schemas/forms";
import { filterUserOptions, filterBoardOptions } from "./utils";
import type { BaseModalProps, UserOption, BoardOption, TeamFormData } from "./types";

interface EditTeamModalProps extends BaseModalProps {
  initialTeamName: string;
  initialUsers: UserOption[];
  users: UserOption[];
  initialBoards: BoardOption[];
  boards: BoardOption[];
  onEdit: (form: TeamFormData & { boards: BoardOption[] }) => void;
  multiUser?: boolean;
}

const teamResolver = zodResolver(
  EditTeamSchema
) as unknown as Resolver<EditTeamFormValues>;

const EditTeamModal: React.FC<EditTeamModalProps> = ({
  initialTeamName,
  initialUsers,
  users,
  initialBoards,
  boards,
  onEdit,
  multiUser = true,
  isOpen,
  onClose,
  loading = false,
  error = null,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditTeamFormValues>({
    resolver: teamResolver,
    defaultValues: {
      teamName: initialTeamName,
      users: initialUsers,
    },
  });

  const selectedUsers = watch("users");
  const [selectedBoards, setSelectedBoards] =
    React.useState<BoardOption[]>(initialBoards);

  // Reset selectedBoards when modal opens or initialBoards changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedBoards(initialBoards);
    }
  }, [isOpen, initialBoards]);

  // Reset users when modal opens or initialUsers changes
  React.useEffect(() => {
    if (isOpen) {
      setValue("users", initialUsers);
    }
  }, [isOpen, initialUsers, setValue]);

  const onSubmit = (data: EditTeamFormValues) => {
    onEdit({
      name: data.teamName, // Map teamName to name for consistency
      users: filterUserOptions(data.users ?? []),
      boards: filterBoardOptions(selectedBoards ?? []),
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      loading={loading}
      error={error}
      title="Edit Team"
      onSubmit={handleSubmit(onSubmit)}
      submitButtonText="Save Changes"
      size="md"
    >
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

      <FormField
        label="Boards"
      >
        <Dropdown
          options={boards}
          value={selectedBoards}
          onChange={(val) =>
            setSelectedBoards(
              filterBoardOptions(Array.isArray(val) ? val : [val])
            )
          }
          placeholder="Select boards"
          multiSelect={true}
        />
      </FormField>
    </FormModal>
  );
};

export default EditTeamModal;
