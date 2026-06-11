import type { Entry } from "../types";
import { MONTHS } from "../constants";
import { czk, dateLabel } from "../utils/format";
import { periodOf } from "../utils/stats";
import { AlertTriangle } from "../icons";

type Props = {
  entry: Entry | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ entry, onConfirm, onCancel }: Props) {
  if (!entry) return null;
  return (
    <div className="od-modal-wrap" onClick={onCancel}>
      <div className="od-modal" onClick={(e) => e.stopPropagation()}>
        <div className="od-modal-ico">
          <AlertTriangle size={22} />
        </div>
        <h3>Smazat zásah?</h3>
        <p>
          {dateLabel(entry.date)} · {MONTHS[periodOf(entry.date).m]} · <b>{czk(entry.amount)}</b>
          <br />
          Tuto akci nelze vrátit zpět.
        </p>
        <div className="od-modal-acts">
          <button className="od-modal-cancel" onClick={onCancel}>Zrušit</button>
          <button className="od-modal-del" onClick={onConfirm}>Smazat</button>
        </div>
      </div>
    </div>
  );
}
