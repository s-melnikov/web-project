class UsersPage extends View {
  constructor(args) {
    super(args);
    this.state = { users: null };
    this.fetchUsers();
    this.events = {
      "click [data-action=remove]": this.handleRemoveClick,
    }
  }

  fetchUsers() {
    const { search: { page, sortBy, order } } = this.props;
    const offset = ((+page || 1) - 1) * DEFAULT_PER_PAGE;
    api.collection("users")
      .get({ offset, limit: DEFAULT_PER_PAGE, sortBy, order })
      .then((response) => {
        this.setState({
          users: response.result,
          usersCount: response.count,
        });
      });
  }

  onUpdate({ search }) {
    if (shallowCompare(search, this.props.search)) return;
    this.fetchUsers();
  }

  handleRemoveClick(event) {
    const { users } = this.state;
    const userId = event.target.getAttribute("data-user-id");
    const user = users.find((user) => user.id === userId);
    showConfirmDialog({
      title: "Warning!",
      message: `Are you sure you want to delete user "${user.first_name} ${user.last_name}"`,
      onConfirm: () => {
        api.collection("users").delete(userId).then(() => {
          showNotification({
            title: "System message",
            message: "User deleted!",
          });
          this.fetchUsers();
        });
      },
    });
  }

  renderList() {
    const { search, path } = this.props;
    const { users } = this.state;
    if (!users) {
      return `<div class="loading"></div>`
    }
    const headers = [
      ["First name", "first_name"],
      ["Last name", "last_name"],
      ["Tel", "tel"],
      ["Email", "email"],
      [],
    ];
    const body = users.map((user) => `
      <div class="tr">
        <div class="td">${user.first_name}</div>
        <div class="td">${user.last_name}</div>
        <div class="td">${user.tel}</div>
        <div class="td">${user.email}</div>
        <div class="td">
          <div class="actions">
            <a href="#!/users/${user.id}" class="action">Edit</a>
            <span data-action="remove" data-user-id="${user.id}" class="action link">Remove</span>
          </div>
        </div>
      </div>
    `).join("");
    return `
      <div class="table">
        <div class="thead">
          <div class="tr">
            ${TableHeaders({ headers, path: "users", search })}
          </div>
        </div>
        <div class="tbody">${body}</div>
      </div>
    `;
  }

  renderFromTo() {
    const { params: { page = 1 } } = this.props;
    const { usersCount } = this.state;
    const from = (page - 1) * DEFAULT_PER_PAGE + 1;
    const to = page * DEFAULT_PER_PAGE;
    return `${from} - ${to > usersCount ? usersCount : to} from ${usersCount}`;
  }

  render() {
    const { search, path } = this.props;
    const { usersCount } = this.state;
    return `
      <div class="container">
        <div class="u-row u-mb u-flex-centered-y">
          <div class="u-col page-title">Users</div>
          <div class="u-col-auto">
            <a href="#!/users/new" class="button">Add user</a>
          </div>
        </div>
        <div class="user-list">
          ${this.renderList()}
        </div>
        <div class="u-row u-mt">
          <div class="u-col-auto">
            ${Pagination({
              count: usersCount,
              maxPages: 9,
              perPage: DEFAULT_PER_PAGE,
              path: "users",
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