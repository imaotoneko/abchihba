class AuthForm {
  selectors = {
    loginData: "[data-js-form-log]",
    registerData: "[data-js-form-reg]",
  };

  constructor() {
    this.init();
  }

  // Обработка логина
  submitLogin(event) {
    event.preventDefault();  // Чтобы форма не перезагружала страницу
    const formLoginElement = document.querySelector(this.selectors.loginData);
    const data = new FormData(formLoginElement);
    const dataObj = Object.fromEntries(data);

    // Отправка запроса на сервер
    fetch("http://localhost:5500/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataObj),
    })
      .then((response) => {
        if (!response.ok) {
          const errorMessage = response.status === 404 ? "Неправильный логин" : "Произошла какая-то ошибка";
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then((json) => {
        console.log(json);
        // Здесь можно добавить действия после успешного входа, например, редирект
        window.location.href = '/success';  // Пример редиректа
      })
      .catch((error) => {
        console.log(error);
        alert("Ошибка: " + error.message);  // Показать ошибку пользователю
      });
  }

  // Обработка регистрации
  submitRegister(event) {
    event.preventDefault();  // Чтобы форма не перезагружала страницу
    const formRegisterElement = document.querySelector(this.selectors.registerData);
    const datas = new FormData(formRegisterElement);
    const dataObjReg = Object.fromEntries(datas);
    console.log(dataObjReg);

    if (dataObjReg.password === dataObjReg.passwordRepeat) {
      fetch("http://localhost:5500/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataObjReg),
      })
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          if (json.message === "Пользователь успешно зарегистрирован") {
            alert("Регистрация прошла успешно!");
            window.location.href = '/success';  // Пример редиректа
          }
        })
        .catch((error) => {
          console.log(error);
          alert("Ошибка: " + error.message);
        });
    } else {
      alert("Пароли не сходятся");
    }
  }

  // Инициализация событий
  init() {
    // Обработчик для формы логина
    document
      .querySelector(this.selectors.loginData)
      .addEventListener("submit", (event) => {
        this.submitLogin(event);
      });

    // Обработчик для формы регистрации
    document
      .querySelector(this.selectors.registerData)
      .addEventListener("submit", (event) => {
        this.submitRegister(event);
      });
  }
}

// Инициализация формы
new AuthForm();
