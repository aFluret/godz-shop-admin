import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
console.log("admin.js loaded");
// === Функция добавления товара ===
async function addProduct() {
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const volume = document.getElementById('volume').value.trim();

    if (!name || !price || !volume) {
        alert("Заполните все обязательные поля");
        return;
    }

    try {
        await addDoc(collection(db, "products"), {
            name,
            price,
            volume
        });

        alert("Товар добавлен!");
        loadProducts(); // Обновляем список
    } catch (e) {
        console.error("Ошибка добавления товара:", e);
        alert("Ошибка при добавлении товара");
    }
}

// === Функция загрузки и отображения товаров ===
async function loadProducts() {
    const container = document.getElementById('products-list');
    container.innerHTML = "<p>Загрузка...</p>";

    try {
        const snapshot = await getDocs(collection(db, "products"));
        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = "<p>Товаров пока нет</p>";
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `
                <strong>${data.name}</strong><br/>
                💰 Цена: ${data.price} ₽<br/>
                📦 Объём: ${data.volume}<br/>
                <button onclick="editProduct('${doc.id}')">Редактировать</button>
                <button onclick="deleteProduct('${doc.id}')">Удалить</button>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.error("Ошибка загрузки товаров:", e);
        container.innerHTML = "<p>Ошибка загрузки данных</p>";
    }
}

// === Авторизация через Telegram ID ===
if (typeof Telegram === 'undefined' || !Telegram.WebApp.initDataUnsafe?.user) {
    document.body.innerHTML = "<h2>Доступ запрещён</h2>";
    throw new Error("Telegram WebApp недоступен");
}

const allowedTelegramId = 123456789; // Замени на свой Telegram ID
const user = Telegram.WebApp.initDataUnsafe.user;

if (user.id !== allowedTelegramId) {
    document.body.innerHTML = "<h2>У вас нет доступа к этой странице</h2>";
    throw new Error("Доступ запрещён");
}

// === Автоматическая загрузка при старте ===
window.onload = () => {
    loadProducts();
};