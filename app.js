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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// === Добавление товара ===
window.addProduct = async function () {
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const volume = document.getElementById('volume').value.trim();

    if (!name || !price || !volume) {
        alert("Заполните все обязательные поля");
        return;
    }

    try {
        await db.collection("products").add({
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
};

// === Загрузка товаров ===
async function loadProducts() {
    const container = document.getElementById('products-list');
    container.innerHTML = "<p>Загрузка...</p>";

    try {
        const snapshot = await db.collection("products").get();
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
                <button onclick="editProduct('${doc.id}', '${data.name}', ${data.price}, '${data.volume}')">Редактировать</button>
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
window.deleteProduct = async function (productId) {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

    try {
        await db.collection("products").doc(productId).delete();
        alert("🗑️ Товар удален!");
        loadProducts();
    } catch (e) {
        console.error("❌ Ошибка удаления:", e);
        alert("Ошибка при удалении товара");
    }
};

// === Редактирование товара ===
window.editProduct = function (id, name, price, volume) {
    const newName = prompt("Введите новое название", name);
    const newPrice = parseFloat(prompt("Введите новую цену", price));
    const newVolume = prompt("Введите новый объём", volume);

    if (!newName || isNaN(newPrice) || !newVolume) {
        alert("Все поля обязательны");
        return;
    }

    db.collection("products").doc(id).update({
        name: newName,
        price: newPrice,
        volume: newVolume
    }).then(() => {
        alert("✏️ Товар обновлён!");
        loadProducts();
    }).catch(e => {
        console.error("❌ Ошибка обновления:", e);
        alert("Ошибка при обновлении товара");
    });
};

// === Автозагрузка при старте ===
window.onload = () => {
    loadProducts();
};