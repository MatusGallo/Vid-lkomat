import { useState } from "react";
import type { Entry } from "../types";
import { parseAmount, groupAmount } from "../utils/format";

export type RowEdit = {
  editId: string | null;
  editVal: string;
  editDate: string;
  setEditVal: (v: string) => void;
  setEditDate: (d: string) => void;
  start: (e: Entry) => void;
  save: () => void;
  cancel: () => void;
};

export function useRowEdit(
  onEdit: (id: string, amount: number, date: string) => void,
): RowEdit {
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [editDate, setEditDate] = useState("");
  const start = (e: Entry) => {
    setEditId(e.id);
    setEditVal(groupAmount(String(e.amount).replace(".", ",")));
    setEditDate(e.date);
  };
  const cancel = () => setEditId(null);
  const save = () => {
    const v = parseAmount(editVal);
    if (v === null || v <= 0) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editDate)) return;
    if (editId) onEdit(editId, v, editDate);
    setEditId(null);
  };
  return { editId, editVal, editDate, setEditVal, setEditDate, start, save, cancel };
}
