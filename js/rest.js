class REST {
  constructor(base, name) {
    this.base = base;
    this.name = name;
  }

  collection(collection) {
    return new REST(this.base, collection);
  }

  getQuery(params) {
    if (!params) return "";
    const query = Object.keys(params)
      .filter((key) => key && params[key])
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    return `?${query}`;        
  }

  request({ method, path, params, payload }) {
    const url = `${this.base}${path}${this.getQuery(params)}`;
    const isFormData = payload instanceof FormData;
    const options = {
      method,
      headers: isFormData ? null : { "Content-Type": "application/json" },
      body: isFormData ? payload : JSON.stringify(payload),
    };
    return fetch(url, options)
      .then((response) => {
        switch (response.status) {
          case REST.HTTPS_STATUSE_OK:
            return response.json();
          default: 
            throw response;
        }
      });
}

  get(params) {
    return this.request({ 
      method: REST.METHOD_GET, 
      path: `/${this.name}`, 
      params,
    });
  }

  getOne(id, params) {
    return this.request({ 
      method: REST.METHOD_GET, 
      path: `/${this.name}/${id}`, 
      params,
    });
  }

  add(item) {
    return this.request({ 
      method: REST.METHOD_POST, 
      path: `/${this.name}`, 
      payload: item,
    });
  }

  update(id, item) {
    return this.request({ 
      method: REST.METHOD_PUT, 
      path: `/${this.name}/${id}`, 
      payload: item,
    });
  }

  delete(id) {
    return this.request({ 
      method: REST.METHOD_DELETE, 
      path: `/${this.name}/${id}`,
    });
  }
}    
REST.HTTPS_STATUSE_OK = 200;
REST.METHOD_GET = "GET";
REST.METHOD_POST = "POST";
REST.METHOD_PUT = "PUT";
REST.METHOD_DELETE = "DELETE";
REST.formData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));
  return formData;
};