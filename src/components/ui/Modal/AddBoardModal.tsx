import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import X from "../../../images/X";
import { BoardSchema, BoardFormValues } from "../../../schemas/forms";

type Board = {
  name: string;
  columns: { id: string; name: string }[];
};

type AddBoardModalProps = {
  onCreate: (form: { name: string; columns: { name: string }[] }) => void;
  board?: Board;
  onEdit?: (form: { name: string; columns: { name: string }[] }) => void;
  onDelete?: () => void;
  defaultEditMode?: boolean;
};

const boardResolver = zodResolver(
  BoardSchema
) as unknown as Resolver<BoardFormValues>;

const AddBoardModal: React.FC<AddBoardModalProps> = ({
  onCreate,
  board,
  onEdit,
  onDelete,
  defaultEditMode = false,
}) => {
  const [isEdit, setIsEdit] = useState(defaultEditMode || !board); // If board is provided, start in view mode or defaultEditMode
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BoardFormValues>({
    resolver: boardResolver,
    defaultValues: board
      ? {
          name: board.name,
          columns: board.columns.map((col) => ({
            id: col.id || crypto.randomUUID(),
            name: col.name,
          })),
        }
      : {
          name: "",
          columns: [
            { id: crypto.randomUUID(), name: "Todo" },
            { id: crypto.randomUUID(), name: "Doing" },
          ],
        },
  });

  useEffect(() => {
    if (board) {
      reset({
        name: board.name,
        columns: board.columns.map((col) => ({
          id: col.id || crypto.randomUUID(),
          name: col.name,
        })),
      });
      setIsEdit(defaultEditMode);
    }
  }, [board, reset, defaultEditMode]);

  const { fields, append, remove } = useFieldArray<BoardFormValues, "columns">({
    control,
    name: "columns",
  });

  const onSubmit = (data: BoardFormValues) => {
    const payload = {
      name: data.name,
      columns: (data.columns ?? [])
        .filter((col) => (col.name ?? "").trim() !== "")
        .map((col) => ({ name: col.name })),
    };
    if (board && isEdit && onEdit) {
      onEdit(payload);
      setIsEdit(false);
    } else {
      onCreate(payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#2b2c37] text-black dark:text-light-gray rounded-lg p-8 w-full max-w-md"
      style={{ minWidth: 400 }}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">
          {board ? (isEdit ? "Edit Board" : "Board Details") : "Add New Board"}
        </h2>
        {board && !isEdit && (
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#22232e] transition"
              aria-label="Board menu"
              tabIndex={0}
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <span className="text-2xl">⋮</span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#2b2c37] rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#22232e] text-sm"
                  type="button"
                  onClick={() => {
                    setIsEdit(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Edit Board
                </button>
                {onDelete && (
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-[#22232e] text-sm"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete();
                    }}
                  >
                    Delete Board
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Name
        </label>
        <TextField
          placeholder="e.g. Web Design"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
          disabled={board && !isEdit}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Columns
        </label>
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
                disabled={board && !isEdit}
              />
              <Button
                type="button"
                icon={<X />}
                iconOnly
                aria-label="Remove column"
                onClick={() => remove(idx)}
                tabIndex={0}
                className="text-gray-400 hover:text-red-500"
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  background: "none",
                  border: "none",
                }}
                disabled={fields.length <= 1 || (board && !isEdit)}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full mt-3"
          onClick={() => append({ id: crypto.randomUUID(), name: "" })}
          disabled={board && !isEdit}
        >
          + Add New Column
        </Button>
      </div>
      {(isEdit || !board) && (
        <Button type="submit" className="w-full" variant="primary-l">
          {board ? "Save Changes" : "Create New Board"}
        </Button>
      )}
    </form>
  );
};

export default AddBoardModal;
