class CompanyPage extends View {
  constructor(args) {
    super(args);
    const { params: { id } } = this.props;
    this.state = {
      user: null,
      companies: null,
    };
    if (id === CompanyPage.NEW_COMPANY_ID) {
      this.state.company = {
        id: "",
        name: "",
        site: "",
        tel: "",
        country: "",
        city: "",
        address: "",
      };
    } else {
      api.collection("companies").getOne(id).then((response) => {
        this.setState({ company: response.result });
      });
    }
    // api.collection("companies").get({ fields: "name,id" }).then((response) => {
    //   this.setState({ companies: response.result });
    // });
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

  renderForm(company) {
    const node = this.querySelector(".company-form .content");
    const innerHTML = `

    `;
    node.innerHTML = innerHTML;
  }

  render() {
    const { company } = this.state;
    if (!company) {
      return `<div class="loading"></div>`;
    }
    return `
      <div class="container">
        <form class="company-form">
          <div class="u-row">
            <div class="u-col-4">
              <div class="content">

                <input type="hidden" name="id" value="${company.id}">

                <label class="u-mb">
                  <span class="label">Company name</span>
                  <input type="text" name="name" value="${company.name}">
                </label>

                <label class="u-mb">
                  <span class="label">Site</span>
                  <input type="text" name="site" value="${company.site}">
                </label>

                <label class="u-mb">
                  <span class="label">Tel</span>
                  <input type="tel" name="tel" value="${company.tel}">
                </label>

                <label class="u-mb">
                  <span class="label">Country</span>
                  <input type="tel" name="country" value="${company.country}">
                </label>

                <label class="u-mb">
                  <span class="label">City</span>
                  <input type="tel" name="city" value="${company.city}">
                </label>

                <label class="u-mb">
                  <span class="label">Address</span>
                  <textarea type="tel" name="address">${company.address}</textarea>
                </label>

              </div>
              <div class="u-row">
                <div class="u-col"></div>
                <div class="u-col-auto">
                  <a href="#!/companies" class="button cancel">Cancel</a>
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

CompanyPage.FORM_CONSTRAINS = {
  name: { required: true, minLength: 1 },
  tel: { tel: true },
};

CompanyPage.NEW_COMPANY_ID = "new";