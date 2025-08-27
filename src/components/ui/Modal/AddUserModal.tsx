import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { AddUserSchema, AddUserFormValues } from "../../../schemas/forms";
import Modal from "./Modal";

const roleOptions = ["user", "admin"];

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (form: AddUserFormValues) => void;
  loading?: boolean;
  error?: string | null;
};

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-[#2b2c37] rounded-lg p-8 w-full max-w-md"
        style={{ minWidth: 400 }}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">Add New User</h2>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">Name</label>
          <TextField
            placeholder="e.g. Jane Doe"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">Email</label>
          <TextField
            placeholder="e.g. jane@example.com"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">Password</label>
          <TextField
            placeholder="Enter password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">Role</label>
          <Dropdown
            options={roleOptions}
            value={selectedRole}
            onChange={(val) =>
              setValue("role", val as string, { shouldValidate: true })
            }
            placeholder="Select role"
          />
          {errors.role && (
            <span className="text-xs text-red-500">{errors.role.message}</span>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          variant="primary-l"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create User"}
        </Button>
        {error && (
          <div className="mt-4 flex justify-center">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
              {error}
            </span>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AddUserModal;
