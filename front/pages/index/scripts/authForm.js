class AuthForm {
  selectors = {
    loginData: "[data-js-form-log]",
    registerData: "[data-js-form-reg]",
  };

  constructor() {
    this.init();
  }

  showSuccessModal() {
    const modal = document.getElementById("successModal");
    const closeBtn = document.getElementById("closeModal");
    const okBtn = document.getElementById("modalOkButton");

    modal.style.display = "block";

    closeBtn.onclick = () => (modal.style.display = "none");
    okBtn.onclick = () => (modal.style.display = "none");

    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }

  // Обработка логина
  submitLogin(event) {
    event.preventDefault();
    const formLoginElement = document.querySelector(this.selectors.loginData);
    const data = new FormData(formLoginElement);
    const dataObj = Object.fromEntries(data);

    fetch("http://localhost:5500/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataObj),
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || "Ошибка при входе");
        }
        console.log(json);
        // Сохраняем токен
        localStorage.setItem("token", json.token);
        window.location.href = "/pages/main/main.html";
      })
      .catch((error) => {
        alert(error.message);
        console.error(error);
      });
  }

  // Обработка регистрации
  submitRegister(event) {
    event.preventDefault();
    const formRegisterElement = document.querySelector(this.selectors.registerData);
    const datas = new FormData(formRegisterElement);
    const dataObjReg = Object.fromEntries(datas);

    if (dataObjReg.password !== dataObjReg.passwordRepeat) {
      alert("Пароли не совпадают");
      return;
    }

    // Отправляем только login и password
    const payload = {
      login: dataObjReg.login,
      password: dataObjReg.password,
    };

    fetch("http://localhost:5500/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || "Ошибка при регистрации");
        }
        console.log(json);
        this.showSuccessModal();
      })
      .catch((error) => {
        alert(error.message);
        console.error(error);
      });
  }

  init() {
    document
      .querySelector(this.selectors.loginData)
      .addEventListener("submit", (event) => this.submitLogin(event));

    document
      .querySelector(this.selectors.registerData)
      .addEventListener("submit", (event) => this.submitRegister(event));
  }
}

new AuthForm();
