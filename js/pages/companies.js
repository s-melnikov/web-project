class CompaniesPage extends View {
  constructor(args) {
    super(args);
    api.collection("companies")
      .get({ limit: 20 })
      .then((response) => {
        this.renderList(response);
      });
  }

  renderList({ result }) {
    const node = this.querySelector(".compamies-list"); 
    const body = result.map((company) => `
      <tr>
        <td><a href="#!/companies/${company.id}">${company.name}</a></td>
        <td><a href="https://${company.id}" target="_blank">${company.site}</a></td>
        <td><a href="tel:${company.tel}">${company.tel}</a></td>
        <td>
          <a href="https://maps.google.com/maps?q=${encodeURIComponent(company.country)}" target="_blank">
            ${company.country}
          </a>
        </td>
      </tr>
    `).join("");
    const innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Site</th>
            <th>Tel</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
    node.innerHTML = innerHTML;
  }

  render() {
    return `
      <div class="container">
        <div class="page-title">Compamies</div>
        <div class="compamies-list"></div>
      </div>
    `;
  }
}