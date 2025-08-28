import React, { useState, useEffect } from "react";
import Checkbox from "../CheckBox/Checkbox";
import { Dropdown } from "../Dropdown/Dropdown";
import Button from "../Button/Button";
import {
  useForm,
  Controller,
  useFieldArray,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ViewTaskSchema, ViewTaskFormValues } from "../../../schemas/forms";

const viewTaskResolver = zodResolver(
  ViewTaskSchema
) as unknown as Resolver<ViewTaskFormValues>;

type ViewTaskModalProps = {
  title: string;
  description: string;
  subtasks: ViewTaskFormValues["subtasks"];
  columnId: string;
  columnOptions: any[];
  onColumnChange?: (columnId: string) => void;
  onEdit: (form: ViewTaskFormValues) => void;
  onDelete: () => void;
};

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
  title,
  description,
  subtasks = [],
  columnId,
  columnOptions = [],
  onEdit,
  onDelete,
  onColumnChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<ViewTaskFormValues>({
      resolver: viewTaskResolver,
      defaultValues: {
        title,
        description,
        columnId,
        subtasks: subtasks.map((s) => ({ ...s })),
      },
    });

  // Keep form state in sync with props if modal is reopened with new data
  useEffect(() => {
    reset({
      title,
      description,
      columnId,
      subtasks: subtasks.map((s) => ({ ...s })),
    });
  }, [title, description, columnId, subtasks, reset]);

  const { fields } = useFieldArray<ViewTaskFormValues, "subtasks">({
    control,
    name: "subtasks",
  });

  const formValues = watch();

  const completedCount = formValues.subtasks
    ? formValues.subtasks.filter((s) => s.completed).length
    : 0;

  const handleSubtaskChange = (id: string | number, checked: boolean) => {
    const idx = fields.findIndex((s) => s.id === id);
    if (idx !== -1) {
      setValue(`subtasks.${idx}.completed`, checked, { shouldDirty: true });
    }
  };

  const handleEdit = () => {
    setIsEdit(true);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    onDelete();
  };

  console.log(columnOptions);

  const onSubmit = (data: ViewTaskFormValues) => {
    setIsEdit(false);
    onEdit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-cente mb-6">
        {isEdit ? (
          <input
            className="text-lg font-bold leading-tight w-full bg-gray-100 dark:bg-[#22232e] rounded px-2 py-1"
            {...register("title")}
            disabled={!isEdit}
          />
        ) : (
          <h2 className="text-lg font-bold leading-tight">
            {formValues.title}
          </h2>
        )}
        <div className="relative">
          <Button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#22232e] transition"
            aria-label="Task menu"
            tabIndex={0}
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            variant="secondary"
          >
            <span className="text-2xl">⋮</span>
          </Button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#2b2c37] rounded shadow-lg z-10">
              <Button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#22232e] text-sm"
                type="button"
                onClick={handleEdit}
                variant="secondary"
              >
                Edit Task
              </Button>
              <Button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-[#22232e] text-sm"
                type="button"
                onClick={handleDelete}
                variant="destructive"
              >
                Delete Task
              </Button>
            </div>
          )}
        </div>
      </div>
      {isEdit ? (
        <textarea
          className="text-gray-900 dark:text-white bg-gray-100 dark:bg-[#22232e] rounded px-2 py-1 mb-6 w-full"
          {...register("description")}
          disabled={!isEdit}
        />
      ) : (
        <p className="text-gray-500 dark:text-gray-300 mb-6">
          {formValues.description}
        </p>
      )}
      <div className="mb-6">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-300 mb-2">
          Subtasks ({completedCount} of {fields.length})
        </div>
        <div className="flex flex-col gap-2">
          <Checkbox
            checkboxes={fields.map((subtask, idx) => ({
              label: subtask.title,
              value: subtask.id,
              checked: formValues.subtasks?.[idx]?.completed || false,
              disabled: !isEdit,
            }))}
            onChange={handleSubtaskChange}
          />
        </div>
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-300 mb-2">
          Current Status
        </div>
        <Controller
          control={control}
          name="columnId"
          render={({ field }) => (
            <Dropdown
              options={columnOptions}
              value={field.value}
              onChange={(val) => {
                let newValue: string;
                if (typeof val === "string") {
                  newValue = val;
                } else if (val && typeof val === "object" && "id" in val) {
                  newValue = val.id;
                } else {
                  // Instead of empty string, fallback to current field value to avoid type error
                  newValue = field.value;
                }
                field.onChange(newValue);
                if (onColumnChange) {
                  onColumnChange(newValue);
                }
              }}
              disabled={!isEdit}
            />
          )}
        />
      </div>
      {isEdit && (
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            variant="primary-l"
          >
            Save
          </Button>
        </div>
      )}
    </form>
  );
};

export default ViewTaskModal;
