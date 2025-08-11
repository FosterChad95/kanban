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
  onDelete?: () => void;
};

type FormValues = {
  name: string;
  columns: { id: string; name: string }[];
};

const EditBoardModal: React.FC<EditBoardModalProps> = ({
  board,
  onEdit,
  onDelete,
}) => {
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
        {onDelete && (
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#22232e] transition text-red-600"
            aria-label="Delete board"
            type="button"
            onClick={onDelete}
          >
            <span className="text-lg font-bold">✕</span>
          </button>
        )}
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
                className="flex-1"
              />
              <button
                type="button"
                className="flex items-center justify-center text-gray-400 hover:text-red-500"
                aria-label="Remove column"
                onClick={() => remove(idx)}
                tabIndex={0}
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  background: "none",
                  border: "none",
                }}
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
          className="w-full mt-3"
          onClick={() => append({ id: crypto.randomUUID(), name: "" })}
        >
          + Add New Column
        </Button>
      </div>
      <Button type="submit" className="w-full" variant="primary-l">
        Save Changes
      </Button>
    </form>
  );
};

export default EditBoardModal;
