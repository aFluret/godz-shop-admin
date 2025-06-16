import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// === Firebase config ===
const firebaseConfig = {
    apiKey: "AIzaSyC31dbuZYH-lpDsdaAwP38cmPZLVXzlMNY",
    authDomain: "godzillavape.firebaseapp.com",
    projectId: "godzillavape",
    storageBucket: "godzillavape.firebasestorage.app",
    messagingSenderId: "66348051875",
    appId: "1:66348051875:web:40c998cae87f83c557be16",
    measurementId: "G-TNDBXFRZYD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let cart = [];

async function fetchProducts() {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => doc.data());
}

function renderProducts(products) {
    const container = document.getElementById('products');
    products.forEach(p => {
        const div = document.createElement('div');
        div.innerHTML = `
            <strong>${p.name}</strong> (${p.volume}) — ${p.price} ₽<br/>
            <button onclick="addToCart('${p.id}', '${p.name}', ${p.price})">Добавить</button>
        `;
        container.appendChild(div);
    });
}

function addToCart(id, name, price) {
    cart.push({ id, name, price });
    updateCart();
    alert("Добавлено в корзину");
}

function updateCart() {
    const ul = document.getElementById('cart');
    ul.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} — ${item.price} ₽`;
        ul.appendChild(li);
    });
}

function sendOrder() {
    if (!cart.length) return alert("Корзина пуста");

    const orderData = {
        total: cart.reduce((sum, item) => sum + item.price, 0),
        items: cart,
        user: Telegram.WebApp.initDataUnsafe.user
    };

    Telegram.WebApp.sendData(JSON.stringify(orderData));
    alert("Заказ отправлен!");
}

// === Автоматическая загрузка при старте ===
fetchProducts().then(renderProducts);