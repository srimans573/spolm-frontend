import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = '',
  className = '',
  style = {},
  id,
  name,
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(null);
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      // sync highlight to current value
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, value, options]);

  const toggle = () => setOpen((v) => !v);

  const commit = (val) => {
    // call onChange with event-like object to be compatible with existing handlers
    onChange({ target: { value: val } });
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => {
        const next = (h == null ? -1 : h) + 1;
        return Math.min(options.length - 1, Math.max(0, next));
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => {
        const next = (h == null ? options.length : h) - 1;
        return Math.min(options.length - 1, Math.max(0, next));
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlight != null) {
        const opt = options[highlight];
        if (opt && !opt.disabled) commit(opt.value);
      } else {
        setOpen(true);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open && listRef.current && highlight != null) {
      const el = listRef.current.children[highlight];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlight]);

  return (
    <div ref={ref} className={`custom-select ${className || ''}`} style={style} id={id} data-name={name}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="custom-select__trigger"
        style={{position:"relative"}}
      >
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {options.find((o) => o.value === value)?.label || placeholder}
        </div>
        <div style={{ marginLeft: 8, color: '#6b7280' }} aria-hidden>▾</div>
      </div>

      {open && (
        <div role="listbox" aria-activedescendant={highlight != null ? `opt-${highlight}` : undefined} className="custom-select__panel" ref={listRef}>
          {options.map((o, i) => (
            <div
              key={o.value + '-' + i}
              id={`opt-${i}`}
              role="option"
              aria-selected={value === o.value}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => !o.disabled && commit(o.value)}
              className={`custom-select__option ${value === o.value ? 'custom-select__option--selected' : ''}`}
              style={{ opacity: o.disabled ? 0.5 : 1, cursor: o.disabled ? 'not-allowed' : 'pointer', }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
