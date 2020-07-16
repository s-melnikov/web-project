 class App {
  static parseQuery(string) {
    const vars = {};
    if (string) {
      string.replace(/^\?/, "").split("&").forEach((keyValuePair) => {
        const [key, value] = keyValuePair.split("=");
        vars[key] = value ? window.decodeURIComponent(value) : true;
      });
    }
    return vars;
  }

  constructor(routes, rootEl) {
    this.rootEl = rootEl;
    this.handleHashChange = this.handleHashChange.bind(this);
    window.addEventListener("hashchange", this.handleHashChange);
    this.routes = routes.map(([prop, view]) => {
      const keys = [];
      const key = this.trim(prop);
      const regexp = key.replace(/:(\w+)/g, (match, group) => {
        keys.push(group);
        return "([^\s\/]+)";
      }).replace("*", "\.+");
      return [regexp, keys, view];
    });
    this.handleHashChange();
    document.body.removeAttribute("cloak");
  }

  handleHashChange() {
    const [path, searchString] = location.hash.split("?");
    const hash = path.slice(2);
    const search = App.parseQuery(searchString);
    const [view, params] = this.routes.reduce((finded, [regexp, keys, view]) => {
      if (finded) return finded;
      const match = new RegExp(regexp).exec(hash);
      if (!match) return null;
      const params = match.slice(1).reduce((res, value, index) => {
        return { ...res, [keys[index]]: value };
      }, {});
      return [view, params];
    }, null);
    this.render({ view, params, search });
  }

  render({ view, params, search }) {
    const props = { params, search };
    if (this.currentViewClass !== view) {
      this.currentViewClass = view;
      if (this.currentViewInstance) {
        this.currentViewInstance.destructor();
      }
      this.currentViewInstance = new view(props);
      this.currentViewInstance.rootEl = this.rootEl;
    }
    this.currentViewInstance.update(props);
  }

  trim(string, sign = "/") {
    return string.replace(new RegExp(`^${sign}+|${sign}+$`, "g"), "");
  }
}

class View {
  constructor(props) {
    this.props = props;
    this.handlers = [];
  }

  setState(state) {
    const oldState = this.state;
    this.state = { ...this.state, ...state };
    this.onUpdate(this.props, oldState);
    this.update();
  }

  destructor() {
    this.undelegateEvents();
  }

  querySelector(query) {
    return this.rootEl.querySelector(query);
  }

  querySelectorAll(query) {
    return this.rootEl.querySelectorAll(query);
  }

  delegate(eventName, selector, method) {
    const handler = (event) => {
      // loop parent nodes from the target to the delegation node
      for (
        let target = event.target;
        target && target != event.currentTarget;
        target = target.parentNode
      ) {
        if (target.matches(selector)) {
          method(event);
          return;
        }
      }
    }
    this.rootEl.addEventListener(eventName, handler);
    this.handlers.push([eventName, handler]);
  }

  delegateEvents() {
    if (!this.events) return;
    for (let prop in this.events) {
      const method = this.events[prop].bind(this);
      const [match, eventName, selector] = prop.match(View.delegateEventSplitter);
      this.delegate(eventName, selector, method);
    }
  }

  undelegateEvents() {
    this.handlers.forEach(([eventName, handler]) =>{
      this.rootEl.removeEventListener(eventName, handler);
    });
  }

  update(props) {
    const oldProps = this.props;
    this.props = { ...this.props, ...props };
    this.onUpdate(oldProps, this.state);
    const html = this.render();
    this.undelegateEvents();
    this.rootEl.innerHTML = html;
    this.delegateEvents();
  }

  onUpdate() {}
}

View.delegateEventSplitter = /^(\S+)\s*(.*)$/;
