// Reusable rows-per-page pager (Show 5/10/20 etc. + range + prev/next).
export function Pager({
  total,
  page,
  pageSize,
  pageSizes,
  onPage,
  onPageSize
}: {
  total: number;
  page: number;
  pageSize: number;
  pageSizes: readonly number[];
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const first = total === 0 ? 0 : safePage * pageSize + 1;
  const last = Math.min(total, safePage * pageSize + pageSize);
  return (
    <div className="pager">
      <div className="pager-sizes" role="group" aria-label="Rows per page">
        <span>Show</span>
        {pageSizes.map((size) => (
          <button
            key={size}
            type="button"
            className={pageSize === size ? "is-active" : ""}
            aria-pressed={pageSize === size}
            onClick={() => onPageSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="pager-nav">
        <span className="pager-range">{first}–{last} of {total}</span>
        <button type="button" aria-label="Previous page" disabled={safePage === 0} onClick={() => onPage(safePage - 1)}>‹</button>
        <button type="button" aria-label="Next page" disabled={safePage >= pageCount - 1} onClick={() => onPage(safePage + 1)}>›</button>
      </div>
    </div>
  );
}
