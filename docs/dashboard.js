/* =========================================================
   個社PMダッシュボード — dashboard.js
   タブ切替・フィルタリング・ソート（Vanilla JS）
   ========================================================= */

(function () {
  'use strict';

  // ---------- タブ切替 ----------
  function initTabs() {
    const buttons = document.querySelectorAll('.tab-nav button');
    const panes = document.querySelectorAll('.tab-pane');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        buttons.forEach((b) => b.classList.toggle('active', b === btn));
        panes.forEach((p) => p.classList.toggle('active', p.id === target));
      });
    });
  }

  // ---------- 汎用フィルタ ----------
  // data-filter-target 属性でテーブルを指定
  // テーブルの各行に data-* 属性で値を持たせ、selectのvalueで一致絞り込み
  function initFilters() {
    document.querySelectorAll('[data-filter-table]').forEach((tableWrap) => {
      const filters = tableWrap.querySelectorAll('[data-filter-key]');
      const table = tableWrap.querySelector('table');
      if (!table) return;

      const apply = () => {
        const criteria = {};
        filters.forEach((sel) => {
          const k = sel.dataset.filterKey;
          const v = sel.value;
          if (v && v !== '__all__') criteria[k] = v;
        });
        table.querySelectorAll('tbody tr').forEach((row) => {
          let visible = true;
          for (const [k, v] of Object.entries(criteria)) {
            if ((row.dataset[k] || '') !== v) {
              visible = false;
              break;
            }
          }
          // 検索ボックスがあればタイトル一致で絞り込む
          const searchBox = tableWrap.querySelector('[data-filter-search]');
          if (visible && searchBox && searchBox.value.trim()) {
            const q = searchBox.value.trim().toLowerCase();
            const txt = (row.dataset.searchable || row.textContent || '').toLowerCase();
            if (!txt.includes(q)) visible = false;
          }
          row.style.display = visible ? '' : 'none';
        });
      };

      filters.forEach((sel) => sel.addEventListener('change', apply));
      const searchBox = tableWrap.querySelector('[data-filter-search]');
      if (searchBox) searchBox.addEventListener('input', apply);
    });
  }

  // ---------- 簡易ソート ----------
  // <th data-sort-key="due_date" data-sort-type="date|number|string"> に対応
  function initSort() {
    document.querySelectorAll('table.data-table').forEach((table) => {
      const ths = table.querySelectorAll('th[data-sort-key]');
      ths.forEach((th) => {
        th.addEventListener('click', () => {
          const key = th.dataset.sortKey;
          const type = th.dataset.sortType || 'string';
          const tbody = table.querySelector('tbody');
          if (!tbody) return;
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const dir = th.dataset.sortDir === 'asc' ? 'desc' : 'asc';
          th.dataset.sortDir = dir;

          // クリアして自分にだけ表示
          table.querySelectorAll('th .sort-indicator').forEach((i) => (i.textContent = ''));
          let indicator = th.querySelector('.sort-indicator');
          if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            th.appendChild(indicator);
          }
          indicator.textContent = dir === 'asc' ? ' ▲' : ' ▼';

          const cmp = (a, b) => {
            const av = a.dataset[key] || '';
            const bv = b.dataset[key] || '';
            if (type === 'number') return Number(av) - Number(bv);
            if (type === 'date') {
              const ad = av ? new Date(av).getTime() : 0;
              const bd = bv ? new Date(bv).getTime() : 0;
              return ad - bd;
            }
            return av.localeCompare(bv, 'ja');
          };
          rows.sort(cmp);
          if (dir === 'desc') rows.reverse();
          rows.forEach((r) => tbody.appendChild(r));
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initFilters();
    initSort();
  });
})();
