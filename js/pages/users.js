class UsersPage extends View {
  constructor(args) {
    super(args);
    this.state = { users: null };
    api.collection("users")
      .get({ limit: 20 })
      .then((response) => {
        this.setState({ 
          users: response.result, 
        });
      });
  }

  renderList() {
    const { users } = this.state;
    if (!users) {
      return `<div class="loading"></div>`
    }
    const body = users.map((user) => `
      <tr>
        <td><a href="#!/users/${user.id}">${user.first_name}</a></td>
        <td><a href="#!/users/${user.id}">${user.last_name}</a></td>
        <td><a href="mailto:${user.email}">${user.email}</a></td>
        <td><a href="tel:${user.tel}">${user.tel}</a></td>
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
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  render() {
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
      </div>
    `;
  }
}