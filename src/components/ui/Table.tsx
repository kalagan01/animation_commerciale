import type { JSX } from 'hono/jsx';

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: any) => any;
}

interface TableProps {
  columns: Column[];
  data: any[];
  keyField?: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: string; // JavaScript function name
  className?: string;
}

export const Table = ({
  columns,
  data,
  keyField = 'id',
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
  className = ''
}: TableProps): JSX.Element => {
  
  const tableClasses = `
    w-full table-auto
    ${bordered ? 'border border-gray-200' : ''}
    ${className}
  `;
  
  const theadClasses = 'bg-gray-50 border-b-2 border-gray-200';
  const thClasses = `px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${compact ? 'py-2' : ''}`;
  
  const getTdClasses = (align: string = 'left') => `
    px-4 py-3 text-sm text-gray-900
    ${compact ? 'py-2' : ''}
    ${align === 'center' ? 'text-center' : ''}
    ${align === 'right' ? 'text-right' : ''}
  `;
  
  const getTrClasses = (index: number) => `
    border-b border-gray-200
    ${striped && index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
    ${hoverable ? 'hover:bg-gray-100 transition-colors duration-150' : ''}
    ${onRowClick ? 'cursor-pointer' : ''}
  `;
  
  if (loading) {
    return (
      <div class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
        <p class="text-gray-600">Chargement des données...</p>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <i class="fas fa-inbox text-5xl text-gray-400 mb-4"></i>
        <p class="text-gray-600 text-lg">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class={tableClasses}>
        <thead class={theadClasses}>
          <tr>
            {columns.map((col) => (
              <th 
                class={thClasses}
                style={col.width ? `width: ${col.width}` : undefined}
              >
                <div class="flex items-center gap-2">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <i class="fas fa-sort text-gray-400 text-xs"></i>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const rowKey = row[keyField] || index;
            const rowClickHandler = onRowClick ? `${onRowClick}('${rowKey}')` : undefined;
            
            return (
              <tr 
                class={getTrClasses(index)}
                onclick={rowClickHandler}
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  const displayValue = col.render ? col.render(value, row) : value;
                  
                  return (
                    <td class={getTdClasses(col.align)}>
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
