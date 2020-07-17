class UserPage extends View {
  constructor(args) {
    super(args);
    const { params: { id } } = this.props;
    this.state = {
      user: null,
      companies: null,
    };
    if (id === UserPage.NEW_USER_ID) {
      this.state.user = {
        id: "",
        first_name: "",
        last_name: "",
        tel: "",
        email: "",
      };
    } else {
      api.collection("users").getOne(id).then((response) => {
        this.setState({ user: response.result });
      });
    }
    api.collection("companies").get({ fields: "name,id" }).then((response) => {
      this.setState({ companies: response.result });
    });
    this.events = {
      "click .submit": this.handleSubmitClick,
    };
  }

  handleSubmitClick(event) {
    const form = this.querySelector("form");
    const hasErrors = validateForm(form, UserPage.FORM_CONSTRAINS);
    if (hasErrors) return;
    const { id, ...values } = getFormData(form);
    const usersApi = api.collection("users");
    const promise = id ? usersApi.update(id, values) : usersApi.add(values);
    promise.then((response) => {
      showNotification({
        title: "System message",
        message: "User saved",
      });
      if (id) return;
      location.hash = `!/users/${response.result}`;
      api.collection("users").getOne(response.result).then((response) => {
        this.setState({ user: response.result });
      });
    });
  }

  render() {
    const { user, companies } = this.state;
    if (!user) {
      return `<div class="loading"></div>`;
    }
    const options = companies && companies.map((company) =>
      `<option value="${company.id}">${company.name}</optipon>`).join("");
    return `
      <div class="container">
        <form class="user-form">
          <div class="u-row">
            <div class="u-col-4">
              <div class="content">

                <input type="hidden" name="id" value="${user.id}">

                <label class="u-mb">
                  <span class="label">First name</span>
                  <input type="text" name="first_name" value="${user.first_name}">
                </label>

                <label class="u-mb">
                  <span class="label">Last name</span>
                  <input type="text" name="last_name" value="${user.last_name}">
                </label>

                <label class="u-mb">
                  <span class="label">Email</span>
                  <input type="email" name="email" value="${user.email}">
                </label>

                <label class="u-mb">
                  <span class="label">Tel</span>
                  <input type="tel" name="tel" value="${user.tel}">
                </label>

                <label class="u-mb">
                  <span class="label">Company</span>
                  <select name="company" value="${user.company}" ${options ? "" : "disabled"}>
                    <option value="">Select company</optipon>
                    ${options}
                  </select>
                </label>

              </div>
              <div class="u-row">
                <div class="u-col"></div>
                <div class="u-col-auto">
                  <a href="#!/users" class="button cancel">Cancel</a>
                </div>
                <div class="u-col-auto">
                  <div class="button primary submit">Submit</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    `;
  }
}

UserPage.FORM_CONSTRAINS = {
  first_name: { required: true, minLength: 1 },
  last_name: { required: true, minLength: 1 },
  email: { email: true },
  tel: { tel: true },
};

UserPage.NEW_USER_ID = "new";