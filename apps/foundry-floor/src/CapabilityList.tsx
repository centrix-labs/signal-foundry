import { useState } from "react";
import type { Capability } from "@signal-foundry/shared";
import { capabilities, riskLabels, statusLabels } from "./data";
import { Pager } from "./ui";

export function CapabilityList({
  records = capabilities,
  selectedId,
  onSelect
}: {
  records?: readonly Capability[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const total = records.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const shown = records.slice(safePage * pageSize, safePage * pageSize + pageSize);
  return (
    <section className="panel capability-list" aria-label="Capability records">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Registry</p>
          <h2>Capability records</h2>
        </div>
      </div>
      <div className="capability-list-scroll">
        {total === 0 ? (
          <p className="empty-state">No records match the current search.</p>
        ) : (
          shown.map((item) => (
            <button key={item.id} type="button" className={selectedId === item.id ? "selected" : ""} aria-pressed={selectedId === item.id} onClick={() => onSelect(item.id)}>
              <span className={`dot ${item.riskLevel}`} />
              <strong>{item.title}</strong>
              <small>{statusLabels[item.status]} / {riskLabels[item.riskLevel]} risk · {item.owner}</small>
            </button>
          ))
        )}
      </div>
      {total > 0 ? (
        <Pager
          total={total}
          page={safePage}
          pageSize={pageSize}
          pageSizes={[5, 10, 20]}
          onPage={setPage}
          onPageSize={(size) => {
            setPageSize(size);
            setPage(0);
          }}
        />
      ) : null}
    </section>
  );
}
