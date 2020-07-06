class UsersPage extends View {
  constructor(args) {
    super(args);
    this.state = { users: null };
    this.fetchUsers();
    this.events = {
      "click [data-action=remove]": this.handleRemoveClick,
      "change .per-page": this.handlePerPageChange,
    }
  }

  fetchUsers() {
    const { params } = this.props;
    const page = Number(params.page) || 1;
    const offset = (page - 1) * DEFAULT_PER_PAGE;
    api.collection("users")
      .get({ offset, limit: DEFAULT_PER_PAGE })
      .then((response) => {
        this.setState({ 
          users: response.result, 
          usersCount: response.count, 
        });
      });
  }

  onUpdate(oldProps) {
    if (oldProps.params.page === this.props.params.page) return;
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

  handlePerPageChange(event) {
    const params = getQueryParams();
    location.search = objectToQueryString({
      ...params,
      perPage: event.target.value,
    });
  }

  renderList() {
    const { users } = this.state;
    if (!users) {
      return `<div class="loading"></div>`
    }
    const body = users.map((user) => `
      <tr>
        <td>${user.first_name}</td>
        <td>${user.last_name}</td>
        <td>${user.email}</td>
        <td>${user.tel}</td>
        <td>
          <a href="#!/users/${user.id}">Edit</a>
          <span data-action="remove" data-user-id="${user.id}" class="link">Remove</span>
        </td>
      </tr>
    `).join("");
    return `
      <table>
        <thead>
          <tr>
            <th>First name</th>
            <th>Last name</th>
            <th>Email</th>
            <th>Tel</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  render() {
    const { usersCount } = this.state;
    const { params } = this.props;
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
        <div class="u-mt">
          ${Pagination({ 
            base: "#!/users/page-", 
            count: usersCount, 
            current: params.page, 
          })}
        </div>
      </div>
    `;
  }
}