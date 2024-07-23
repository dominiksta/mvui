import { TemplateElement } from "@mvuijs/core";
import Ui5Table from "@ui5/webcomponents/dist/Table";
import Ui5TableColumn from "@ui5/webcomponents/dist/TableColumn";
import Ui5TableRow from "@ui5/webcomponents/dist/TableRow";
import Ui5TableGroupRow from "@ui5/webcomponents/dist/TableGroupRow";
import Ui5TableCell from "@ui5/webcomponents/dist/TableCell";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableColumn.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableGroupRow.js";
import "@ui5/webcomponents/dist/TableCell.js";

/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-table--docs
 )
 */
export const table = TemplateElement.fromCustom<Ui5Table, {
  slots: {
    default: Ui5TableRow,
    columns: Ui5TableColumn,
  },
  events: {
    'load-more': CustomEvent,
    'popin-change': CustomEvent<{ poppedColumns: Ui5TableColumn[] }>,
    'row-click': CustomEvent<{ row: Ui5TableColumn }>,
    'selection-change': CustomEvent<{
      selectedRows: Ui5TableRow[],
      previouslySelectedRows: Ui5TableRow[],
    }>,
  }
}
>(() => document.createElement('ui5-table') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-table--docs
 )
 */
export const tableColumn = TemplateElement.fromCustom<Ui5TableColumn, {
  slots: {
    default: any,
  },
}
>(() => document.createElement('ui5-table-column') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-table--docs
 )
 */
export const tableRow = TemplateElement.fromCustom<Ui5TableRow, {
}
>(() => document.createElement('ui5-table-row') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-table--docs
 )
 */
export const tableGroupRow = TemplateElement.fromCustom<Ui5TableGroupRow, {
}
>(() => document.createElement('ui5-table-group-row') as any);


/**
 @see [Official Docs](
   https://sap.github.io/ui5-webcomponents/playground/?path=/docs/main-table--docs
 )
 */
export const tableCell = TemplateElement.fromCustom<Ui5TableCell, {
}
>(() => document.createElement('ui5-table-cell') as any);
