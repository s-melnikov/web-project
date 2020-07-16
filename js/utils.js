const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const TEL_REGEXP = /^\d{7,15}$/;
const TEL_NORMALIZE_REGEXP = /[ +-]/g;

function getFieldError(value, constrain) {
  if (!value) {
    if (constrain.required) {
      return "This field is required";
    }
    return false;
  }
  if (constrain.minLength && (value.length < constrain.minLength)) {
    return `This field must contain at least ${minLength} characters`;
  }
  if (constrain.email && !value.match(EMAIL_REGEXP)) {
    return "Incorrect email address";
  }
  if (constrain.phone) {
    if (!value.replace(TEL_NORMALIZE_REGEXP, "").math(TEL_REGEXP)) {
      return "Incorrect phone number";
    }
  }
  return false;
}

function validateForm(form, constrains) {
  const fields = form.querySelectorAll("input, select, textarea");
  let errorsCount = 0;
  fields.forEach((field) => {
    const name = field.name;
    const value = field.value;
    const constrain = constrains[name];
    const parent = field.parentNode;
    const error = constrain && getFieldError(value, constrain);
    if (error) {
      errorsCount++;
      parent.setAttribute("data-error", error);
    } else {
      parent.removeAttribute("data-error");
    }
  });
  return errorsCount;
}

function getFormData(form) {
  const fields = form.querySelectorAll("input, select, textarea");  
  const result = {};
  fields.forEach((field) => {
    const name = field.name;
    const value = field.value;
    result[name] = value;
  });
  return result;
}

function toQuery(params) {
  return Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join("&");
}

function showNotification({ title, message }) {
  const container = document.querySelector(".notifications");
  let notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerHTML = `
    <div class="title">${title}</div>
    <div class="message">${message}</div>
    <div class="close">&times;</div>
  `;
  container.appendChild(notification);
  const remove = () => {
    if (!notification) return;
    container.removeChild(notification);
    notification = null;
  };
  notification.querySelector(".close").addEventListener("click", remove);
  setTimeout(remove, 3000);
}

function showConfirmDialog({ title, message, onConfirm }) {
  const dialog = document.querySelector(".dialog");
  const close = document.querySelector(".dialog-close");
  const cancel = document.querySelector(".dialog-actions .cancel");
  const handleCloseClick = (event) => {
    close.removeEventListener("click", handleCloseClick);
    cancel.removeEventListener("click", handleCloseClick);
    dialog.classList.remove("showed");
  }
  close.addEventListener("click", handleCloseClick);
  cancel.addEventListener("click", handleCloseClick);
  if (title) {
    dialog.querySelector(".dialog-title").innerHTML = title;
  }
  if (message) {
    dialog.querySelector(".dialog-content").innerHTML = message;
  }
  if (onConfirm) {
    const button = dialog.querySelector(".dialog-actions .submit");
    const handleClick = (event) => {
      button.removeEventListener("click", handleClick);
      handleCloseClick(event);
      setTimeout(() => onConfirm(event), 0);
    }
    button.addEventListener("click", handleClick);
  }
  dialog.classList.add("showed");
}
