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
// Проверка наличия Telegram WebApp
console.log(typeof Telegram)
if (typeof Telegram === 'undefined') {

    document.body.innerHTML = "<h2>❌ Админка доступна только через Telegram</h2>";
    throw new Error("Telegram WebApp недоступен");
}

Telegram.WebApp.ready();

const allowedTelegramId = 424666580; // Замени на свой Telegram ID
const user = Telegram.WebApp.initDataUnsafe?.user;

if (!user || user.id !== allowedTelegramId) {
    document.body.innerHTML = `<h1>❌ Доступ запрещён</h1><p>Вы не авторизованы</p>`;
    throw new Error("Доступ запрещён для пользователя с ID: " + user?.id);
}

// === Инициализация Firebase ===
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);


async function fetchImagesFromServer() {
    const response = await fetch('/api/upload');
    const files = await response.json();

    return files.filter(file => file.type === 'file' && file.name.match(/\.(jpg|jpeg|png|gif)$/i));
}

async function populateImageSelect() {
    const imageSelect = document.getElementById('imageSelect');
    const images = await fetchImagesFromServer();

    images.forEach(image => {
        const option = document.createElement('option');
        option.value = image.download_url; // URL изображения
        option.textContent = image.name;
        imageSelect.appendChild(option);
    });
}

// === Добавление товара ===
window.addProduct = async function () {
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const volume = document.getElementById('volume').value.trim();
    const count = document.getElementById('count').value.trim();
    let imageUrl = null;

    const imageSelect = document.getElementById('imageSelect');
    const selectedImageUrl = imageSelect.value;

    if (!name || !price || !volume || isNaN(count)) {
        alert("Заполните все обязательные поля");
        return;
    }


    if (!selectedImageUrl) {
        alert("Выберите изображение");
        return;
    }


    try {
       
        await db.collection("products").add({
            name,
            price,
            volume,
            count,
            imageUrl: selectedImageUrl
        });

        alert("✅ Товар добавлен!");
        document.getElementById('name').value = "";
        document.getElementById('price').value = "";
        document.getElementById('volume').value = "";
        document.getElementById('count').value = "";
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
            <img src="${data.imageUrl}" alt="${data.name}" width="50" height="50" />
            <strong>${data.name}</strong><br/>
            💰 Цена: ${data.price} ₽<br/>
            📦 Объём: ${data.volume}<br/>
            📊 Количество: ${data.count}<br/> <!-- Новое поле -->
            <button onclick="editProduct('${doc.id}', '${data.name}', ${data.price}, '${data.volume}', ${data.count}, '${data.imageUrl}')">Редактировать</button>
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
window.editProduct = function (id, name, price, volume,count) {
    const newName = prompt("Введите новое название", name);
    const newPrice = parseFloat(prompt("Введите новую цену", price));
    const newVolume = prompt("Введите новый объём", volume);
    const newCount = parseInt(prompt("Введите новое количество", count));


    if (!newName || isNaN(newPrice) || !newVolume || isNaN(newCount)) {
        alert("Все поля обязательны");
        return;
    }

    db.collection("products").doc(id).update({
        name: newName,
        price: newPrice,
        volume: newVolume,
        count: newCount
    }).then(() => {
        alert("✏️ Товар обновлён!");
        loadProducts();
    }).catch(e => {
        console.error("❌ Ошибка обновления:", e);
        alert("Ошибка при обновлении товара");
    });
};

// === Автозагрузка при старте ===
window.onload = async() => {
    loadProducts();
    await populateImageSelect();
};