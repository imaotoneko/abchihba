let cart = [];
const cartModal = document.getElementById("cartModal");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

function updateCartUI() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="cart-modal__empty">Корзина пуста</p>`;
    cartTotal.textContent = "Итого: 0 ₽";
  } else {
    let total = 0;
    cart.forEach((item, index) => {
      total += item.price;
      cartItems.innerHTML += `
        <div class="cart-modal__item">
          <span>${item.name}</span>
          <span>${item.price} ₽</span>
          <button onclick="removeFromCart(${index})">❌</button>
        </div>
      `;
    });
    cartTotal.textContent = `Итого: ${total} ₽`;
  }
  cartCount.textContent = cart.length;
}

function addToCart(name, price) {
  cart.push({ name, price });
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}



// Открытие / закрытие модалки
cartBtn.onclick = () => cartModal.style.display = "block";
closeCart.onclick = () => cartModal.style.display = "none";
window.onclick = (e) => { if (e.target === cartModal) cartModal.style.display = "none"; };
