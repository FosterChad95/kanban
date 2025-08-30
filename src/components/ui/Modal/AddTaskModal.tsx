import React from "react";
import {
  useForm,
  Controller,
  useFieldArray,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dropdown } from "../Dropdown/Dropdown";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import X from "../../../images/X";
import { AddTaskSchema, AddTaskFormValues } from "../../../schemas/forms";

const addTaskResolver = zodResolver(
  AddTaskSchema
) as unknown as Resolver<AddTaskFormValues>;

type SubtaskCreateInput = {
  title: string;
  isCompleted: boolean;
};

type AddTaskModalProps = {
  columns: { id: string; name: string }[];
  boardId: string;
  onCreate: (form: {
    title: string;
    description: string;
    columnId: string;
    subtasks: SubtaskCreateInput[];
    boardId: string;
  }) => void;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  columns,
  boardId,
  onCreate,
}) => {
  const defaultColumnId = columns && columns.length > 0 ? columns[0].id : "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddTaskFormValues>({
    resolver: addTaskResolver,
    defaultValues: {
      title: "",
      description: "",
      columnId: defaultColumnId,
      subtasks: [
        { id: crypto.randomUUID(), title: "" },
        { id: crypto.randomUUID(), title: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subtasks",
  });

  const onSubmit = (data: AddTaskFormValues) => {
    const subtasks: SubtaskCreateInput[] = (data.subtasks ?? [])
      .filter((s) => s.title.trim() !== "")
      .map((s) => ({
        title: s.title,
        isCompleted: false,
      }));

    const payload = {
      title: data.title,
      description: data.description as string,
      columnId: data.columnId,
      subtasks,
      boardId,
    };

    onCreate(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#2b2c37] text-black dark:text-light-gray rounded-lg p-8 w-full max-w-md"
      style={{ minWidth: 400 }}
    >
      <h2 className="text-xl font-bold mb-6">Add New Task</h2>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Title
        </label>
        <TextField
          placeholder="e.g. Take coffee break"
          {...register("title")}
          error={errors.title?.message}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Description
        </label>
        <textarea
          className="w-full px-4 py-2 rounded-[4px] border border-[rgba(130,143,163,0.25)] bg-white dark:bg-[#22232e] heading-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-main-purple focus:ring-opacity-25 focus:border-main-purple hover:border-main-purple"
          placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
          rows={4}
          {...register("description")}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Subtasks
        </label>
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <TextField
                placeholder={
                  idx === 0 ? "e.g. Make coffee" : "e.g. Drink coffee & smile"
                }
                {...register(`subtasks.${idx}.title` as const)}
                className="flex-1"
              />
              <Button
                type="button"
                icon={<X />}
                iconOnly
                aria-label="Remove subtask"
                onClick={() => remove(idx)}
                tabIndex={0}
                className="text-gray-400 hover:text-red-500"
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full mt-3"
          onClick={() => append({ id: crypto.randomUUID(), title: "" })}
        >
          + Add New Subtask
        </Button>
      </div>
      <div className="mb-6">
        <label className="block text-xs font-bold mb-2 text-black dark:text-light-gray">
          Column
        </label>
        <Controller
          control={control}
          name="columnId"
          render={({ field }) => {
            return (
              <Dropdown
                options={columns.map((col) => ({
                  id: col.id,
                  name: col.name,
                }))}
                value={field.value}
                onChange={(val: unknown) => {
                  // If Dropdown returns the whole option, extract id; otherwise, pass as is
                  if (typeof val === "object" && val !== null && "id" in val) {
                    field.onChange((val as { id: string }).id);
                  } else {
                    field.onChange(val as string);
                  }
                }}
              />
            );
          }}
        />
      </div>
      <Button type="submit" className="w-full" variant="primary-l">
        Create Task
      </Button>
    </form>
  );
};

export default AddTaskModal;
