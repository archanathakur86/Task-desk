export default function SortableHeader({ label, field, sort, order, onSort }) {
  const isActive = sort === field;

  return (
    <th scope="col" aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="sort-btn" title={`Sort by ${label}`} onClick={() => onSort(field)}>
        {label}
        <span className={`sort-arrow${isActive ? ` sort-arrow-${order}` : ''}`} aria-hidden="true" />
      </button>
    </th>
  );
}
