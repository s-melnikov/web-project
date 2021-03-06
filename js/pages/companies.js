class CompaniesPage extends View {
  constructor(args) {
    super(args);
    this.state = { companies: null };
    this.fetchCompanies();
    this.events = {
      "click [data-action=remove]": this.handleRemoveClick,
    }
  }

  fetchCompanies() {
    const { search: { page, sortBy, order } } = this.props;
    const offset = ((+page || 1) - 1) * DEFAULT_PER_PAGE;
    api.collection("companies")
      .get({ offset, limit: DEFAULT_PER_PAGE, sortBy, order })
      .then((response) => {
        this.setState({
          companies: response.result,
          companiesCount: response.count,
        });
        this.rootEl.scrollTop = 0;
      });
  }

  onUpdate({ search }) {
    if (shallowCompare(search, this.props.search)) return;
    this.fetchCompanies();
  }

  handleRemoveClick(event) {
    const { companies } = this.state;
    const companyId = event.target.getAttribute("data-company-id");
    const company = companies.find((company) => company.id === companyId);
    showConfirmDialog({
      title: "Warning!",
      message: `Are you sure you want to delete company "${company.name}"`,
      onConfirm: () => {
        api.collection("companies").delete(companyId).then(() => {
          showNotification({
            title: "System message",
            message: "Company deleted!",
          });
          this.fetchCompanies();
        });
      },
    });
  }

  renderList() {
    const { search } = this.props;
    const { companies } = this.state;
    if (!companies) {
      return `<div class="loading"></div>`
    }
    const headers = [
      ["Name", "name"],
      ["Site", "site"],
      ["Country", "country"],
      ["Tel", "tel"],
      [],
    ];
    const body = companies.map((company) => `
      <div class="tr">
        <div class="td">${company.name}</div>
        <div class="td">${company.site}</div>
        <div class="td">${company.country}</div>
        <div class="td">${company.tel}</div>
        <div class="td">
          <div class="actions">
            <a href="#!/companies/${company.id}" class="action">Edit</a>
            <span data-action="remove" data-company-id="${company.id}" class="action link">Remove</span>
          </div>
        </div>
      </div>
    `).join("");
    return `
      <div class="table">
        <div class="thead">
          <div class="tr">
            ${TableHeaders({ headers, path: "companies", search })}
          </div>
        </div>
        <div class="tbody">${body}</div>
      </div>
    `;
  }

  renderFromTo() {
    const { search: { page = 1 } } = this.props;
    const { companiesCount } = this.state;
    const from = (page - 1) * DEFAULT_PER_PAGE + 1;
    const to = page * DEFAULT_PER_PAGE;
    return `${from} - ${to > companiesCount ? companiesCount : to} from ${companiesCount}`;
  }

  render() {
    const { search } = this.props;
    const { companiesCount } = this.state;
    return `
      <div class="container">
        <div class="u-row u-mb u-flex-centered-y">
          <div class="u-col page-title">Companies</div>
          <div class="u-col-auto">
            <a href="#!/companies/new" class="button">Add company</a>
          </div>
        </div>
        <div class="companies-list">
          ${this.renderList()}
        </div>
        <div class="u-row u-mt">
          <div class="u-col-auto">
            ${Pagination({
              count: companiesCount,
              maxPages: 9,
              perPage: DEFAULT_PER_PAGE,
              path: "companies",
              search,
            })}
          </div>
          <div class="u-col-auto u-flex-centered-y">
            ${this.renderFromTo()}
          </div>
        </div>
      </div>
    `;
  }
}