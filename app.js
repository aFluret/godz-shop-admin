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

async function uploadImage(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    return new Promise((resolve, reject) => {
        reader.onload = async () => {
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        file: reader.result,
                        filename: file.name
                    })
                });

                const result = await response.json();

                resolve(result.url);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = () => reject(reader.error);
    });
}

// === Добавление товара ===
window.addProduct = async function () {
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const volume = document.getElementById('volume').value.trim();
    const count = document.getElementById('count').value.trim();
    let imageUrl = null;


    if (!name || !price || !volume || isNaN(count)) {
        alert("Заполните все обязательные поля");
        return;
    }
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];

    if (!file) {
        alert("Пожалуйста, выберите изображение.");
        return;
    }


    try {
        imageUrl = await uploadImage(file);
        await db.collection("products").add({
            name,
            price,
            volume,
            count,
            imageUrl
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
            <img src="${data.imageUrl || '/placeholder.png'}" alt="${data.name}" width="50" height="50" />
            <strong>${data.name}</strong><br/>
            💰 Цена: ${data.price} ₽<br/>
            📦 Объём: ${data.volume}<br/>
            📊 Количество: ${data.quantity}<br/> <!-- Новое поле -->
            <button onclick="editProduct('${doc.id}', '${data.name}', ${data.price}, '${data.volume}', ${data.quantity}, '${data.imageUrl}')">Редактировать</button>
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
window.onload = () => {
    loadProducts();
};