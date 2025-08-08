import Board from "../components/content/Board/Board";
import { demoColumns } from "../../data/mock/board";

export default function Home() {
  return <Board columns={demoColumns} />;
}
