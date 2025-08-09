class AuthForm {
  selectors = {
    loginData: "[data-js-form-log]",
    registerData: "[data-js-form-reg]",
  };

  constructor() {
    this.init()
  }

  submitLogin(event) {
    const formLoginElement = document.querySelector(this.selectors.loginData)
    const data = new FormData(formLoginElement)
    const dataObj = Object.fromEntries(data)

    fetch("/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataObj),
      })
      .then((response) => {
        if (!response.ok) {
          const errorMessage =
            response.ok === "404"
              ? "Неправильный логин"
              : "Произошла какая-то ошибка";
          throw new Error(errorMessage)
        }
        return response.json()
      })
      .then((json) => {console.log(json)})
      .catch((error) => {
        console.log(error)
      })
  }

  submitRegister(event) {
    const formRegisterElement = document.querySelector(this.selectors.registerData)
    const datas = new FormData(formRegisterElement)
    const dataObjReg = Object.fromEntries(datas)
    console.log(dataObjReg)

    if (dataObjReg.password === dataObjReg.passwordRepeat) {
      fetch("/api/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataObjReg),
          })
          .then((response) => response.json())
          .then((json) => console.log(json))
    } else {
      alert('Пароли не сходятся')
    }
  }

  init() {
    document
      .querySelector(this.selectors.loginData)
      .addEventListener("submit", (event) => {
        event.preventDefault()
        this.submitLogin(event)
      })
    document
      .querySelector(this.selectors.registerData)
      .addEventListener("submit", (event) => {
        event.preventDefault()
        this.submitRegister(event)
      })
  }
}

new AuthForm()
