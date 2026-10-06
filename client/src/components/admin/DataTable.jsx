/**
 * Shared table for the admin area.
 *
 * On wide screens this renders a normal table. On small screens the CSS in
 * `index.css` turns each row into a stacked card and each cell picks up its
 * label from `data-label`, so no separate mobile markup is needed.
 *
 * `rows` is an array of cell arrays. Each cell is `{ key, label, render }`.
 * Pass `rowKey` (a function returning a stable id per row) so React can track
 * rows across re-renders; the row index is used as a fallback.
 */
export default function DataTable({ headers, rows, caption, rowKey = null }) {
  return (
    <div className="table-wrap">
      <table className="table table--responsive">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, rowIndex) => (
            <tr key={rowKey ? rowKey(cells, rowIndex) : rowIndex}>
              {cells.map((cell) => (
                <td key={cell.key} data-label={cell.label}>
                  {cell.render()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
