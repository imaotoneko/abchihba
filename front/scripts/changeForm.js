export class changeForm {
  classes = {
    formHidden: "auth__form--hidden",
  }

  elements = {
    loginForm: document.querySelector('.auth__form--login'),
    registerForm: document.querySelector('.auth__form--register'),
    switcherToRegister: document.getElementById('switchToRegister'),
    switcherToLogin: document.getElementById("switchToLogin"),
  }

  constructor() {
    this.bindEvents()
  }

  bindEvents() {
    this.elements.switcherToRegister.onclick = () => {
      this.elements.loginForm.classList.add(this.classes.formHidden)
      this.elements.registerForm.classList.remove(this.classes.formHidden)
    }

    this.elements.switcherToLogin.onclick = () => {
      this.elements.registerForm.classList.add(this.classes.formHidden)
      this.elements.loginForm.classList.remove(this.classes.formHidden)
    }
  }
}