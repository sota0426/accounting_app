let totalAmount = 0;
let menuTotals = {}; // グローバルに定義

document.addEventListener("DOMContentLoaded", () => {
    fetchOrderHistory();
});

function fetchOrderHistory() {
    const orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    displayOrderHistory(orders);
    displayOrderTotal(orders);
}

function displayOrderHistory(orders) {
    const historyTableBody = document.querySelector("#historyTable tbody");
    historyTableBody.innerHTML = "";

    orders.forEach((order, index) => {
        const orderRow = document.createElement("tr");
        orderRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.items.map(item => `${item.menuName}×${item.quantity}`).join(" , ")}</td>
            <td>${order.total}</td>
            <td><button onclick="cancelOrder(${index})">注文キャンセル</button>
        `;
        historyTableBody.appendChild(orderRow);
    });
}

function displayOrderTotal(orders) {
    const totalTableBody = document.querySelector("#totalTable tbody");
    totalTableBody.innerHTML = "";

    menuTotals = {};
    totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.total;

        order.items.forEach(item => {
            const menuId = item.menuId;
            if (!menuTotals[menuId]) {
                menuTotals[menuId] = {
                    menuId: item.menuId,
                    menuName: item.menuName,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal
                };
            } else {
                menuTotals[menuId].quantity += item.quantity;
                menuTotals[menuId].subtotal += item.subtotal;
            }
        });
    });

    Object.keys(menuTotals).forEach(menuId => {
        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `
            <td>${menuTotals[menuId].menuId}</td>
            <td>${menuTotals[menuId].menuName}</td>
            <td>¥${menuTotals[menuId].price}</td>
            <td>${menuTotals[menuId].quantity}</td>
            <td>¥${menuTotals[menuId].subtotal}</td>
        `;
        totalTableBody.appendChild(totalRow);
    });

    const totalContainer = document.getElementById("totalAmount");
    totalContainer.style.textAlign = "right";
    totalContainer.style.marginTop = "20px";
    totalContainer.innerHTML = `<h3 style="text-decoration:underline;">合計金額：￥${totalAmount}</h3>`;
}

function cancelOrder(orderIndex) {
    // orderHistoryを取得
    const orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const canceledOrder = orders.splice(orderIndex, 1)[0]; // 指定の注文を削除し、その削除した注文を取得

    // 削除された注文の各メニューの在庫を元に戻す
    canceledOrder.items.forEach(item => {
        const menus = JSON.parse(localStorage.getItem('menus')) || [];
        const menu = menus.find(menu => menu.menuId === item.menuId);
        if (menu) {
            menu.stock += item.quantity; // 在庫を戻す
        }
        localStorage.setItem('menus', JSON.stringify(menus)); // 在庫を更新
    });

    // 更新された注文履歴を保存
    localStorage.setItem('orderHistory', JSON.stringify(orders));

    // 更新された履歴とメニューを表示
    fetchOrderHistory();
}


function downloadSalesData() {
    let csvContent = "\uFEFFNo.,メニュー名,金額,注文数,小計\n"; // BOMを追加

    Object.keys(menuTotals).forEach(menuId => {
        const menu = menuTotals[menuId];
        csvContent += `${menu.menuId},${menu.menuName},¥${menu.price},${menu.quantity},¥${menu.subtotal}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "menu_sales_data.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}
