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
import type { Task, TaskUpdatePayload } from "@/util/types";
import {
  mapTaskToViewTaskForm,
  mapViewTaskFormToTaskUpdatePayload,
} from "@/util/typeMappers";

const viewTaskResolver = zodResolver(
  ViewTaskSchema
) as unknown as Resolver<ViewTaskFormValues>;

type ViewTaskModalProps = {
  task: Task;
  columnOptions: any[];
  onColumnChange?: (columnId: string) => void;
  onEdit: (form: TaskUpdatePayload) => void;
  onDelete: () => void;
};

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
  task,
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
      defaultValues: mapTaskToViewTaskForm(task),
    });

  // Keep form state in sync with props if modal is reopened with new data
  useEffect(() => {
    reset(mapTaskToViewTaskForm(task));
  }, [task, reset]);

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

  const onSubmit = (data: ViewTaskFormValues) => {
    setIsEdit(false);
    onEdit(mapViewTaskFormToTaskUpdatePayload(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center mb-6">
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
            className="p-2 rounded-full bg-transparenttransition"
            aria-label="Task menu"
            tabIndex={0}
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            variant="secondary"
          >
            <span className="text-2xl">⋮</span>
          </Button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded shadow-lg z-10">
              <Button
                className="block w-full text-left px-4 py-2 bg-transparent hover:bg-transparent text-sm"
                type="button"
                onClick={handleEdit}
                variant="secondary"
              >
                Edit Task
              </Button>
              <Button
                className="block w-full text-left px-4 py-2 text-red-600 bg-transparent hover:bg-transparent text-sm"
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
