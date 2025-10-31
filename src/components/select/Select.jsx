import { useState, useEffect, useRef, useMemo } from "react"

import styles from './Select.module.css'

export const Select = ({
  data = [],
  label,
  id = "select_search",
  placeholder = "Начните вводить...",
  labelKey = "name",
  valueKey = "code",
  searchKeys,
  onChange,
  selected,
  register,
  validation,
  errors
}) => {
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState(selected ?? "");
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(data);

  const effectiveSearchKeys = useMemo(
    () => searchKeys ?? [labelKey, valueKey],
    [searchKeys, labelKey, valueKey]
  );

  useEffect(() => {
    const q = (query ?? "").trim().toLowerCase();
    if (!q) {
      setFiltered(data);
    } else {
      setFiltered(
        data.filter(item =>
          effectiveSearchKeys.some(k => {
            const v = (item[k] ?? "").toString().toLowerCase();
            return v.includes(q);
          })
        )
      );
    }
  }, [query, data, effectiveSearchKeys]);

  useEffect(() => {
    if (typeof selected === "string" && selected !== query) {
      setQuery(selected);
    }
    if (selected === "" && query !== "") {
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    const onOutClick = (e) => {
      if (
        !inputRef?.current?.contains(e.target) &&
        !listRef?.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutClick);
    return () => document.removeEventListener("mousedown", onOutClick);
  }, []);

  const handleSelect = (item) => {
    const labelVal = item[labelKey];
    setQuery(labelVal ?? "");
    setOpen(false);
    if (typeof onChange === "function") onChange(item);
  };

  return (
    <div className={styles.formGroup} style={{ position: "relative" }}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <input
        id={id}
        ref={inputRef}
        type="text"
        className={styles.input}
        value={query}
        placeholder={placeholder}
        {...(register ? register(id, validation) : {})}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          setOpen(true);
          if (val === "" && typeof onChange === "function") {
            onChange(null);
          }
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        aria-haspopup="listbox"
        aria-expanded={open}
      />

      {open && (
        <ul
          ref={listRef}
          className={styles.countryDropdown}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 30,
            maxHeight: 220,
            overflowY: "auto",
            width: "100%",
            marginTop: 70,
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            background: "white",
            listStyle: "none",
            padding: 0,
            borderRadius: 6
          }}
        >
          {filtered.length === 0 && (
            <li className={styles.countryOption} style={{ padding: 10 }}>
              Ничего не найдено
            </li>
          )}
          {filtered.map((item) => (
            <li
              key={`${item[valueKey]}_${item[labelKey]}`}
              className={styles.countryOption}
              role="option"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
              style={{ padding: 10, cursor: "pointer", borderBottom: "1px solid #eee" }}
              data-component='item'
            >
              <span>{item[labelKey]}</span>
            </li>
          ))}
        </ul>
      )}

      {errors && errors[labelKey] && <span className={styles.error}>{errors[labelKey].message}</span>}
    </div>
  );
};

