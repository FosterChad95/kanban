import React, { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../TextField/TextField";
import { FormModal, FormField } from "./FormModal";
import { EditUserSchema, EditUserFormValues } from "../../../schemas/forms";
import type { BaseModalProps, UserFormData } from "./types";

interface EditUserModalProps extends BaseModalProps {
  initialName: string;
  initialEmail: string;
  initialAvatar?: string;
  onEdit: (form: UserFormData & { avatar?: string }) => void;
}

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

  // Reset form values whenever the modal opens or the initial props change
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
    // Preserve the existing avatar value
    onEdit({
      name: data.name,
      email: data.email,
      avatar: initialAvatar || undefined,
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      loading={loading}
      error={error}
      title="Edit User"
      onSubmit={handleSubmit(onSubmit)}
      submitButtonText="Save Changes"
      size="md"
    >
      <FormField
        label="Name"
        error={errors.name?.message}
        required
      >
        <TextField
          placeholder="e.g. John Doe"
          {...register("name")}
          error={errors.name?.message}
        />
      </FormField>

      <FormField
        label="Email"
        error={errors.email?.message}
        required
      >
        <TextField
          placeholder="e.g. john@example.com"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
      </FormField>
    </FormModal>
  );
};

export default EditUserModal;
