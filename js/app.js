class App {
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
    this.hash = this.trim(location.hash.slice(2));
    const [view, params] = this.routes.reduce((finded, [regexp, keys, view]) => {
      if (finded) return finded;
      const match = new RegExp(regexp).exec(this.hash);
      if (!match) return null;
      const params = match.slice(1).reduce((res, value, index) => {
        return { ...res, [keys[index]]: value };
      }, {});
      return [view, params];
    }, null);

    this.render(view, params);
  }

  render(view, params) {
    if (this.currentViewClass !== view) {
      this.currentViewClass = view;
      if (this.currentViewInstance) {
        this.currentViewInstance.destructor();
      }
      this.currentViewInstance = new view({
        rootEl: this.rootEl,
        props: { params },
      });
    }
    this.currentViewInstance.update();
  }

  trim(string, sign = "/") {
    return string.replace(new RegExp(`^${sign}+|${sign}+$`, "g"), "");
  }
}

class View {
  constructor({ rootEl, props }) {
    this.rootEl = rootEl;
    this.props = props;
    this.handlers = [];
  }

  setState(state) {
    this.state = { ...this.state, ...state };
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

  update() {    
    const html = this.render();
    this.undelegateEvents();
    this.rootEl.innerHTML = html;
    this.delegateEvents();
  }
}

View.delegateEventSplitter = /^(\S+)\s*(.*)$/;
