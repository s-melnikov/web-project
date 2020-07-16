function Select(params) {
  return `<select class="${params.class || ""}">${
    params.options.map((option) =>
    `<option
      value="${option.value}"
      ${(option.value === params.value) ? "selected" : ""}>
      ${option.label}
    </option>`)
  }</select>`;
}

function PaginationItem({ path, page, search, label, disabled }) {
  return `<a
    href="#!/${path}?${toQuery({ ...search, page })}"
    class="button"
    ${disabled ? "disabled" : ""}>${label}</a>`;
}

function Pagination(params) {
  const {
    count,
    perPage,
    maxPages,
    path,
    search,
  } = params;
  const page = Number(search.page) || 1;
  const pageCount = (count && perPage) ? Math.ceil(count / perPage) : 0;
  if (pageCount < 2) return "";
  let endPage = 1 + maxPages;
  let startPage = 1;
  const half = maxPages / 2;
  if (page > half) {
    startPage = Math.ceil(page - half);
    endPage = Math.ceil(page + half);
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
  for (let i = startPage; i < endPage; i++) {
    list.push(PaginationItem({
      page: i,
      disabled: page === i,
      label: i,
      path,
      search,
    }));
  }
  return `<div class="pagination">
    ${PaginationItem({
      page: 1,
      disabled: page === 1,
      label: "First",
      path,
      search,
    })}
    ${list.join("")}
    ${PaginationItem({
      page: pageCount,
      disabled: page === pageCount,
      label: "Last",
      path,
      search,
    })}
  </div>`;
}

function TableHeader({ label = "", prop, path, search }) {
  const sortBy = prop;
  const active = search.sortBy === sortBy;
  const order = (!active || search.order === "desc") ? "asc" : "desc";
  return `<div class="td">
    <a
      href="#!/${path}?${toQuery({ ...search, sortBy, order, page: 1 })}"
      ${active ? `class="active"` : ""}>${label}</a>
  </div>`;
}

function TableHeaders({ headers, path, search }) {
  return headers.map(([label, prop]) => TableHeader({ label, prop, path, search })).join("");
}