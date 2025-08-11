import React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Dropdown } from "../Dropdown/Dropdown";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import X from "../../../images/X";

type AddTaskModalProps = {
  statusOptions: string[];
  onCreate: (form: {
    title: string;
    description: string;
    status: string;
    subtasks: { title: string }[];
  }) => void;
};

type FormValues = {
  title: string;
  description: string;
  status: string;
  subtasks: { id: string; title: string }[];
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  statusOptions,
  onCreate,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      status: statusOptions[0] || "",
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

  const onSubmit = (data: FormValues) => {
    onCreate({
      title: data.title,
      description: data.description,
      status: data.status,
      subtasks: data.subtasks
        .filter((s) => s.title.trim() !== "")
        .map((s) => ({ title: s.title })),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#2b2c37] rounded-lg p-8 w-full max-w-md"
      style={{ minWidth: 400 }}
    >
      <h2 className="text-xl font-bold mb-6">Add New Task</h2>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">Title</label>
        <TextField
          placeholder="e.g. Take coffee break"
          {...register("title", { required: "Title is required" })}
          error={errors.title?.message}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">Description</label>
        <textarea
          className="w-full px-4 py-2 rounded-[4px] border border-[rgba(130,143,163,0.25)] bg-white heading-medium placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-main-purple focus:ring-opacity-25 focus:border-main-purple hover:border-main-purple"
          placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
          rows={4}
          {...register("description")}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">Subtasks</label>
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
        <label className="block text-xs font-bold mb-2">Status</label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Dropdown
              options={statusOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <Button type="submit" className="w-full" variant="primary-l">
        Create Task
      </Button>
    </form>
  );
};

export default AddTaskModal;
