import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { FormModal, FormField, ErrorDisplay } from "./FormModal";
import { AddUserSchema, AddUserFormValues } from "../../../schemas/forms";
import { ROLE_OPTIONS } from "./utils";
import type { BaseModalProps } from "./types";

interface AddUserModalProps extends BaseModalProps {
  onCreate: (form: AddUserFormValues) => void;
}

const userResolver = zodResolver(
  AddUserSchema
) as unknown as Resolver<AddUserFormValues>;

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  loading = false,
  error = null,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: userResolver,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (data: AddUserFormValues) => {
    onCreate(data);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      loading={loading}
      error={error}
      title="Add New User"
      onSubmit={handleSubmit(onSubmit)}
      submitButtonText="Create User"
      size="md"
    >
      <FormField
        label="Name"
        error={errors.name?.message}
        required
      >
        <TextField
          placeholder="e.g. Jane Doe"
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
          placeholder="e.g. jane@example.com"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
      </FormField>

      <FormField
        label="Password"
        error={errors.password?.message}
        required
      >
        <TextField
          placeholder="Enter password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
      </FormField>

      <FormField
        label="Role"
        error={errors.role?.message}
        required
      >
        <Dropdown
          options={[...ROLE_OPTIONS]}
          value={selectedRole}
          onChange={(val) =>
            setValue("role", val as string, { shouldValidate: true })
          }
          placeholder="Select role"
        />
      </FormField>

      <ErrorDisplay error={error} className="mt-4 flex justify-center" />
    </FormModal>
  );
};

export default AddUserModal;
