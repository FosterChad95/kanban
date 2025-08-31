import React from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import X from "../../../images/X";
import {
  BoardSchema,
  BoardFormValues,
  type BoardInput,
} from "../../../schemas/forms";

type TeamOption = {
  id: string;
  name: string;
};

const boardResolver = zodResolver(
  BoardSchema
) as unknown as Resolver<BoardFormValues>;

type EditBoardModalProps = {
  board: BoardInput & { teamIds?: string[] };
  onEdit: (form: BoardInput & { teamIds?: string[] }) => void;
  /// Make teams optional
  teams?: TeamOption[];
};

const EditBoardModal: React.FC<EditBoardModalProps> = ({
  board,
  onEdit,
  teams = [],
}) => {
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>(
    board.teamIds || []
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BoardFormValues>({
    resolver: boardResolver,
    defaultValues: {
      name: board.name,
      columns: (board.columns ?? []).map((col) => ({
        id: col.id,
        name: col.name,
      })),
    },
  });

  React.useEffect(() => {
    reset({
      name: board.name,
      columns: (board.columns ?? []).map((col) => ({
        id: col.id,
        name: col.name,
      })),
    });
    setSelectedTeamIds(board.teamIds || []);
  }, [board, reset]);

  const { fields, append, remove } = useFieldArray<BoardFormValues, "columns">({
    control,
    name: "columns",
  });

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const onSubmit = (data: BoardFormValues) => {
    const payload: BoardInput & { teamIds?: string[] } = {
      name: data.name,
      columns: (data.columns ?? [])
        .filter((col) => (col.name ?? "").trim() !== "")
        .map((col) =>
          col.id ? { id: col.id, name: col.name } : { name: col.name }
        ),
      teamIds: selectedTeamIds,
    };
    onEdit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#2b2c37] text-black dark:text-light-gray rounded-lg p-8 w-full max-w-md"
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
                className="flex items-center justify-center text-light-gray dark:text-light-gray hover:text-red-500"
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
          onClick={() => append({ name: "" })}
        >
          + Add New Column
        </Button>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">
          Teams with Access
        </label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-900">
          {teams.map((team) => {
            const selected = selectedTeamIds.includes(team.id);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => toggleTeamSelection(team.id)}
                className={`px-3 py-1 rounded-full border ${
                  selected
                    ? "bg-main-purple text-white border-main-purple"
                    : "bg-gray-200 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-main-purple`}
              >
                {team.name}
              </button>
            );
          })}
        </div>
      </div>
      <Button type="submit" className="w-full flex-col" variant="primary-l">
        Save Changes
      </Button>
    </form>
  );
};

export default EditBoardModal;
