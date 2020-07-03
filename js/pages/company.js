class CompanyPage extends View {
  constructor(args) {
    super(args);
    const { params: { id } } = this.props;

    api.collection("companies").getOne(id).then(({ result }) => {
      this.renderForm(result);
    })
  }

  renderForm(company) {
    const node = this.querySelector(".company-form .content"); 
    const innerHTML = `
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
    `;
    node.innerHTML = innerHTML;
  }

  render() {
    return `
      <div class="container">
        <div class="page-title">Company</div>
        <form class="company-form">
          <div class="u-row">
            <div class="u-col-4">
              <div class="content"></div>
              <div class="u-row">
                <div class="u-col"></div>
                <div class="u-col-auto">
                  <div class="button cancel">Cancel</div>
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