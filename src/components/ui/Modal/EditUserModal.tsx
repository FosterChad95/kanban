import React, { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import Modal from "./Modal";
import { EditUserSchema, EditUserFormValues } from "../../../schemas/forms";

type EditUserModalProps = {
  initialName: string;
  initialEmail: string;
  initialAvatar?: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (form: { name: string; email: string; avatar?: string }) => void;
  loading?: boolean;
  error?: string | null;
};

const userResolver = zodResolver(
  EditUserSchema
) as unknown as Resolver<EditUserFormValues>;

const EditUserModal: React.FC<EditUserModalProps> = ({
  initialName,
  initialEmail,
  initialAvatar = "",
  isOpen,
  onClose,
  onEdit,
  loading = false,
  error = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditUserFormValues>({
    resolver: userResolver,
    defaultValues: {
      name: initialName,
      email: initialEmail,
      avatar: initialAvatar,
    },
  });

  // Reset form values whenever the modal opens or the initial props change.
  // This ensures the email (and other fields) are populated when clicking "Edit".
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialName,
        email: initialEmail,
        avatar: initialAvatar,
      });
    }
  }, [isOpen, initialName, initialEmail, initialAvatar, reset]);

  const onSubmit = (data: EditUserFormValues) => {
    // Don't allow editing the avatar — preserve the existing avatar value.
    onEdit({
      name: data.name,
      email: data.email,
      avatar: initialAvatar || undefined,
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
          <h2 className="text-xl font-bold">Edit User</h2>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">Name</label>
          <TextField
            placeholder="e.g. John Doe"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">Email</label>
          <TextField
            placeholder="e.g. john@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        {error && <div className="mb-4 text-center text-red-500">{error}</div>}
        <Button
          type="submit"
          className="w-full"
          variant="primary-l"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Modal>
  );
};

export default EditUserModal;
