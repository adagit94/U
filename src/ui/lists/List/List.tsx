import SearchInput from "@/components/ui/inputs/SearchInput/SearchInput";
import useSearch, { UseSearchOptions } from "@/hooks/useSearch";
import { memo, useCallback, useMemo } from "react";
import "./List.scss";
import { Checkbox } from "@/components/ui/checkbox";

export type ListItem = { id: string; name?: string; selected?: boolean };

export type ListProps<T extends ListItem> = {
  items: T[];
  title?: string;
  search?: UseSearchOptions<T>;
  itemDisplayKey?: keyof T;
  renderHeader?: () => React.ReactNode;
  renderHeaderButtons?: () => React.ReactNode;
  renderItem?: (item: T, index: number) => React.ReactNode;
  addItem?: () => void;
  copyItem?: (item: T, index: number) => void;
  deleteItem?: (item: T, index: number) => void;
  onDrop?: (index: number, prevIndex: number) => void;
  onSelectionChange?: (value: boolean, index: number) => void;
  onClick?: (item: T, index: number) => void;
};

// List items should be managed outside, cached and passed through props.
const List = <T extends ListItem>({
  title,
  search,
  items,
  itemDisplayKey = "name",
  addItem,
  copyItem,
  deleteItem,
  onDrop,
  onSelectionChange,
  onClick,
  renderHeader,
  renderHeaderButtons,
  renderItem,
}: ListProps<T>) => {
  const { searchResults: filteredItems, searchValue, setSearchValue } = useSearch({ ...search, items });

  const onSearchChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setSearchValue(e.target.value);
    },
    [setSearchValue],
  );

  const listItems = useMemo(() => {
    const draggable = !!onDrop;
    const selectable = !!onSelectionChange;

    return filteredItems.map((item) => {
      const i = items.findIndex(({ id }) => id === item.id);

      return (
        <li
          key={item.id}
          draggable={draggable}
          onDragStart={
            draggable
              ? (e) => {
                  e.stopPropagation();

                  e.dataTransfer.setData("text/plain", item.id);
                  e.dataTransfer.dropEffect = "move";
                  e.dataTransfer.effectAllowed = "move";
                }
              : undefined
          }
          onDragEnter={
            draggable
              ? (e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  e.dataTransfer.dropEffect = "move";
                  e.dataTransfer.effectAllowed = "move";
                }
              : undefined
          }
          onDragOver={
            draggable
              ? (e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  e.dataTransfer.dropEffect = "move";
                  e.dataTransfer.effectAllowed = "move";
                }
              : undefined
          }
          onDrop={
            draggable
              ? (e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  const id = e.dataTransfer.getData("text/plain");
                  const prevI = items.findIndex((item) => item.id === id);

                  if (onDrop && prevI !== -1 && i !== prevI) onDrop(i, prevI);
                }
              : undefined
          }
          onClick={onClick ? () => onClick(item, i) : undefined}
        >
          <span className="list__item-content">
            {selectable && (
              <Checkbox checked={item.selected} onCheckedChange={(v) => onSelectionChange?.(Boolean(v), i)} />
            )}

            {draggable && <i className="dx-icon dx-icon-drag-abra txt2 abra-icon" />}

            {renderItem ? renderItem(item, i) : <div>{String(item[itemDisplayKey] ?? "")}</div>}
          </span>

          <span className="list-item-buttonSpace">
            {copyItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyItem(item, i);
                }}
                className="edit-copy-btn bg103"
              >
                <i className="dx-icon dx-icon-pages-abra txt3 abra-icon"></i>
              </button>
            )}

            {deleteItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item, i);
                }}
                className="edit-clear-btn"
              >
                <span className="icon-clear"></span>
              </button>
            )}
          </span>
        </li>
      );
    });
  }, [filteredItems, items, onClick, renderItem, onDrop, copyItem, deleteItem, itemDisplayKey]);

  return (
    <div className="list">
      <div className="list__header">
        <h3>{title ?? ""}</h3>
        <div className="list__header-toolbar">
          {search && <SearchInput value={searchValue} placeholder="Hledat" onChange={onSearchChange} />}

          {renderHeaderButtons?.()}
        </div>
      </div>

      {items.length > 0 ? (
        <>
          <div className="list__columns">{renderHeader?.()}</div>
          <ul>{listItems}</ul>
        </>
      ) : (
        <p className="noItemsInfo">Seznam neobsahuje žádné položky</p>
      )}

      <div className="list__header-buttons">
        {addItem && (
          <button onClick={addItem} title={`Přidat položku do sekce ${title}`}>
            <i className="dx-icon dx-icon-plus-abra txt3 abra-icon" />
            <span>Přidat do {title ? title : "seznamu"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(List) as typeof List;
