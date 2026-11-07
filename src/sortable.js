// Listas donde el orden es el dato (@stackcraftmx/calcita/sortable): una tabla chica cuyos renglones se arrastran con el
// ratón, el dedo o el teclado (o se mueven con sus botones «Subir» y «Bajar»), con la columna «Orden» 1..n. La tabla suelta
// (SortableTable), la de formik (FormSortableField) y moveRow para mover desde otra parte de la pantalla. Pide
// @hello-pangea/dnd (18), la misma del tablero kanban.
//
// Con react-hook-form:
//   <Controller name="stops" control={control} render={({field, fieldState}) => (
//       <SortableTable rows={field.value} onReorder={({rows}) => field.onChange(rows)} columns={columns}
//                      ariaLabel="Ruta de reparto" error={fieldState.error?.message} />
//   )} />
export {default as FormSortableField} from '@/sortable/FormSortableField.jsx';
export {default as SortableTable} from '@/sortable/SortableTable.jsx';
export {moveRow} from '@/sortable/sortableRows.js';
