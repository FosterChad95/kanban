import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import X from "../../../images/X";

type Board = {
  name: string;
  columns: { id: string; name: string }[];
};

type EditBoardModalProps = {
  board: Board;
  onEdit: (form: { name: string; columns: { name: string }[] }) => void;
};

type FormValues = {
  name: string;
  columns: { id: string; name: string }[];
};

const EditBoardModal: React.FC<EditBoardModalProps> = ({ board, onEdit }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      name: board.name,
      columns: board.columns.map((col) => ({
        id: col.id || crypto.randomUUID(),
        name: col.name,
      })),
    },
  });

  React.useEffect(() => {
    reset({
      name: board.name,
      columns: board.columns.map((col) => ({
        id: col.id || crypto.randomUUID(),
        name: col.name,
      })),
    });
  }, [board, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "columns",
  });

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      columns: data.columns
        .filter((col) => col.name.trim() !== "")
        .map((col) => ({ name: col.name })),
    };
    onEdit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#2b2c37] rounded-lg p-8 w-full max-w-md"
      style={{ minWidth: 400 }}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">Edit Board</h2>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">Board Name</label>
        <TextField
          placeholder="e.g. Web Design"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">Board Columns</label>
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <TextField
                placeholder={
                  idx === 0 ? "Todo" : idx === 1 ? "Doing" : "Column name"
                }
                {...register(`columns.${idx}.name` as const, {
                  required: true,
                })}
                className="flex-grow"
              />
              <button
                type="button"
                className="flex items-center justify-center text-light-gray hover:text-red-500"
                aria-label="Remove column"
                onClick={() => remove(idx)}
                tabIndex={0}
                disabled={fields.length <= 1}
              >
                <X />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full mt-3 flex-col"
          onClick={() => append({ id: crypto.randomUUID(), name: "" })}
        >
          + Add New Column
        </Button>
      </div>
      <Button type="submit" className="w-full flex-col" variant="primary-l">
        Save Changes
      </Button>
    </form>
  );
};

export default EditBoardModal;
