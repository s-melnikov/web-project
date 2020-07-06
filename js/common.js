function Select(params) {
  return `<select class="${params.class || ""}">${
    params.options.map((option) => 
      `<option value="${option.value}" ${(option.value === params.value) ? "selected" : ""}>${option.label}</option>`)
  }</select>`;
}

const PER_PAGE_OPTIONS = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];
function PerPageSelect(params) {
  params = params || {};
  params.value = params.value || DEFAULT_PER_PAGE;
  params.options = PER_PAGE_OPTIONS;
  return Select(params);
}
function PaginationItem(params) {
  return `<a 
    href="${params.base}${params.page}" 
    class="button"
    ${params.disabled ? "disabled" : ""}>${params.label}</a>`;
}
function Pagination(params) {
  params = params || {};
  const count = Number(params.count) || 0;
  const current = Number(params.current) || 1;
  const perPage = Number(params.perPage) || DEFAULT_PER_PAGE;
  const maxPages = 5;
  const pageCount = (count && perPage) ? Math.ceil(count / perPage) : 0;
  if (pageCount < 2) return "";
  let endPage = 1 + maxPages;
  let startPage = 1;
  const half = Math.ceil(maxPages / 2);  
  if (current > half) {
    startPage = current - half;
    endPage = current + half;
    if (endPage >= pageCount) {
      endPage = 1 + pageCount;
      startPage = 1 + pageCount - maxPages;
      if (startPage < 1) startPage = 1;
    }
  } else if (pageCount < maxPages) {
    endPage = 1 + pageCount;
    startPage = 1;
  }
  const list = [];
  console.log({ startPage, endPage });
  for (let i = startPage; i < endPage; i++) {
    list.push(PaginationItem({
      page: i,
      disabled: current === i,
      label: i,
      base: params.base,
    }));
  }
  return `<div class="pagination">
    ${PaginationItem({ 
      page: 1, 
      disabled: current === 1, 
      label: "First", 
      base: params.base,
    })}
    ${list.join("")}
    ${PaginationItem({ 
      page: pageCount, 
      disabled: current === pageCount, 
      label: "Last", 
      base: params.base,
    })}
  </div>`;
}