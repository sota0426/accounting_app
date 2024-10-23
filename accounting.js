let menus = JSON.parse(localStorage.getItem('menus')) || []; // グローバル変数としてメニューを保持
let orders = {}; // 注文内容を管理するオブジェクト
let hideSoldOutItems = false; // 売り切れ商品を非表示にするかどうかのフラグ
let startOrder = true; //注文後にTrueになる。
let totalAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    displayMenus(menus);

    document.getElementById("toggleSoldOutButton").addEventListener("click", toggleSoldOutItems);

    const paymentInput = document.getElementById("paymentAmount");
    paymentInput.addEventListener("keypress", function(event){
        if(event.key === "Enter"){
            event.preventDefault();
            orderPayment();
        }
    });
    paymentInput.focus();
});

function focusPaymentInput() {
    const paymentInput = document.getElementById("paymentAmount");
    paymentInput.focus(); // 支払金額のインプットボックスを常にアクティブにする
}

function toggleSoldOutItems(){
    hideSoldOutItems = !hideSoldOutItems;
    const button = document.getElementById("toggleSoldOutButton");
    button.textContent = hideSoldOutItems ? "売り切れ商品の表示" : "売り切れ商品の非表示";
    displayMenus(menus);
}

function displayMenus(menus) {
    const menuTableBody = document.querySelector('#menuTable tbody');
    menuTableBody.innerHTML = ''; // 既存のメニューリストをクリア

    const categories = {};
    menus.forEach(menu => {
        if (!categories[menu.categoryName]) {
            categories[menu.categoryName] = [];
        }
        categories[menu.categoryName].push(menu);
    });

    Object.keys(categories).forEach(categoryName => {
        const categoryRow = document.createElement('tr');
        categoryRow.classList.add('category-row');
        categoryRow.innerHTML = `<td colspan="5">[${categories[categoryName][0].menuId}] ${categoryName}</td>`;
        menuTableBody.appendChild(categoryRow);

        categories[categoryName].forEach(menu => {
            if (!hideSoldOutItems || menu.stock > 0) {
                const menuRow = document.createElement('tr');
                menuRow.classList.add('menu-row');
                menuRow.setAttribute("data-menu-id", menu.menuId);
                menuRow.innerHTML = `
                    <td class="menu-id">No.${menu.menuId}</td>
                    <td>${menu.menuName}</td>
                    <td>¥${menu.price}</td>
                    <td class="menu-stock">${menu.stock}</td>
                    <td class="operation-cell">
                        <button class="menu-plus" onclick="addOrder(${menu.menuId})">＋</button>
                        <button class="menu-minus" onclick="removeOrder(${menu.menuId})">－</button>
                    </td>
                `;
                if (menu.stock === 0) {
                    menuRow.querySelector('.menu-plus').disabled = true;
                    menuRow.querySelector('.menu-plus').style.backgroundColor = '#ccc';
                }
                menuTableBody.appendChild(menuRow);
            }
        });
    });
}

function addOrder(menuId) {
    focusPaymentInput();
    const changeDisplay = document.getElementById("change");
    changeDisplay.textContent = "";

    if (startOrder == false) {
        orders = {};
        startOrder = true;
    };

    const menuItem = menus.find(menu => menu.menuId === menuId);
    if (menuItem.stock > 0) {
        menuItem.stock--;

        if (orders[menuId]) {
            orders[menuId].quantity++;
        } else {
            orders[menuId] = {
                menuId: menuItem.menuId,
                menuName: menuItem.menuName,
                price: menuItem.price,
                quantity: 1
            };
        }

        orders[menuId].subtotal = orders[menuId].quantity * orders[menuId].price;

        const menuRow = document.querySelector(`tr[data-menu-id="${menuId}"]`);
        if (menuRow) {
            const stockCell = menuRow.querySelector(".menu-stock");
            if (stockCell) {
                stockCell.textContent = menuItem.stock;
            }
            const plusButton = menuRow.querySelector(".menu-plus");
            if (menuItem.stock === 0) {
                plusButton.disabled = true;
                plusButton.style.backgroundColor = "#ccc";
            }
        }

        updateOrderDisplay();
        updateTotalAmount();
    }
}

function removeOrder(menuId) {
    focusPaymentInput();
    if (orders[menuId] && orders[menuId].quantity > 0) {
        const menuItem = menus.find(menu => menu.menuId === menuId);
        orders[menuId].quantity--;
        menuItem.stock++;

        if (orders[menuId].quantity === 0) {
            delete orders[menuId];
        } else {
            orders[menuId].subtotal = orders[menuId].quantity * orders[menuId].price;
        }

        document.querySelector(`button.menu-plus[onclick="addOrder(${menuId})"]`).disabled = false;
        document.querySelector(`button.menu-plus[onclick="addOrder(${menuId})"]`).style.backgroundColor = '#4CAF50';

        updateOrderDisplay();
        updateTotalAmount();
    }
}

function updateOrderDisplay() {
    const orderList = document.getElementById("orderList");
    orderList.innerHTML = "";

    Object.values(orders).forEach(order => {
        const orderItem = document.createElement("div");
        orderItem.classList.add("order-item");
        orderItem.innerHTML = `${order.menuName} × ${order.quantity} = ￥${order.subtotal}`;
        orderList.appendChild(orderItem);
    });

    menus.forEach(menu => {
        const menuRow = document.querySelector(`tr[data-menu-id="${menu.menuId}"]`);
        if (menuRow) {
            menuRow.querySelector(".menu-stock").textContent = menu.stock;
        }
    });

    localStorage.setItem('menus', JSON.stringify(menus)); // メニューの在庫を更新
}

function updateTotalAmount() {
    totalAmount = Object.values(orders).reduce((total, order) => total + order.subtotal, 0);
    document.getElementById('totalAmount').textContent = totalAmount;
}

function orderCancelButton() {
    Object.keys(orders).forEach(menuId => {
        const menuItem = menus.find(menu => menu.menuId == menuId);
        if (menuItem) {
            menuItem.stock += orders[menuId].quantity;
        }
    });

    orders = {};

    document.querySelectorAll('button.menu-plus').forEach(button => {
        button.disabled = false;
        button.style.backgroundColor = '#4CAF50';
    });

    updateOrderDisplay();
    updateTotalAmount();
    displayMenus(menus);
}

function orderPayment() {
    const paymentInput = document.getElementById("paymentAmount");
    const paymentAmount = parseFloat(paymentInput.value);
    const totalAmount = parseFloat(document.getElementById('totalAmount').textContent);
    const change = paymentAmount - totalAmount;
    const changeDisplay = document.getElementById("change");

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        changeDisplay.textContent = "金額を正しく入力してください。";
        return;
    }

    if (change < 0) {
        changeDisplay.textContent = "金額が不足しています。";
    } else {
        changeDisplay.innerHTML = `おつりは <span style="font-size: 1.5em; color: red;">¥${change}</span> です。`;
        
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.push({ items: Object.values(orders), total: totalAmount });
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

        updateOrderDisplay();
        updateTotalAmount();
        startOrder = false;

        disableOrderButtons();  // 注文ボタンを無効化
        document.getElementById('nextOrderButton').style.display = 'block';  // 「次の会計に進む」ボタンを表示
    }

    paymentInput.value = "";
    focusPaymentInput();
}



document.getElementById('nextOrderButton').addEventListener('click', resetForNextOrder);

function disableOrderButtons() {
    document.querySelectorAll('button.menu-plus').forEach(button => {
        button.disabled = true;
        button.style.backgroundColor = '#ccc';
    });
}

function enableOrderButtons() {
    document.querySelectorAll('button.menu-plus').forEach(button => {
        button.disabled = false;
        button.style.backgroundColor = '#4CAF50';
    });
}

function resetForNextOrder() {
    orders = {};  // 注文内容のリセット
    totalAmount = 0;  // 合計金額のリセット
    document.getElementById('totalAmount').textContent = totalAmount;
    document.getElementById('change').textContent = ''; // おつりのリセット

    enableOrderButtons();  // 注文ボタンを再び有効化

    document.getElementById('nextOrderButton').style.display = 'none';  // 「次の会計に進む」ボタンを非表示
    focusPaymentInput();
}

