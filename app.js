import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    deleteDoc,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

// === Инициализация Firebase ===
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === Добавление товара ===
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

        alert("✅ Товар добавлен!");
        document.getElementById('name').value = "";
        document.getElementById('price').value = "";
        document.getElementById('volume').value = "";
        loadProducts(); // Обновляем список
    } catch (e) {
        console.error("❌ Ошибка добавления:", e);
        alert("Ошибка при добавлении товара");
    }
}

// === Загрузка товаров ===
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
        console.error("❌ Ошибка загрузки:", e);
        container.innerHTML = "<p>Ошибка загрузки данных</p>";
    }
}

// === Удаление товара ===
async function deleteProduct(productId) {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

    try {
        await deleteDoc(doc(db, "products", productId));
        alert("🗑️ Товар удален!");
        loadProducts();
    } catch (e) {
        console.error("❌ Ошибка удаления:", e);
        alert("Ошибка при удалении товара");
    }
}

// === Редактирование товара (пример) ===
async function editProduct(productId) {
    const newName = prompt("Введите новое название:");
    const newPrice = parseFloat(prompt("Введите новую цену:"));
    const newVolume = prompt("Введите новый объём:");

    if (!newName || isNaN(newPrice) || !newVolume) {
        alert("Все поля обязательны");
        return;
    }

    try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
            name: newName,
            price: newPrice,
            volume: newVolume
        });

        alert("✏️ Товар обновлён!");
        loadProducts();
    } catch (e) {
        console.error("❌ Ошибка обновления:", e);
        alert("Ошибка при обновлении товара");
    }
}

// === Автозагрузка при старте ===
window.onload = () => {
    loadProducts();
};