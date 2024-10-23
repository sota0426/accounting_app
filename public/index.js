document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadMenus();
});

document.getElementById('categoryForm').addEventListener('submit', function(event) {
    event.preventDefault(); // デフォルトのフォーム送信を防ぐ

    const categoryName = document.getElementById('categoryName').value;
    const categories = JSON.parse(localStorage.getItem('categories')) || [];

    const newCategory = {
        categoryId: categories.length + 1,
        categoryName
    };
    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategories();
    document.getElementById('categoryForm').reset();
});

function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    const categorySelect = document.getElementById('menuCategoryName');
    categorySelect.innerHTML = ''; // プルダウンメニューをリセット

    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category-item');
        categoryDiv.innerHTML = `
            <div class="category-header">
                <span>[${category.categoryId}]  ${category.categoryName}</span>
                <div>
                    <button class="category-delete" onclick="deleteCategory(${category.categoryId})">削除</button>
                    <button class="up" onclick="moveCategory(${category.categoryId}, 'up')">上に移動</button>
                    <button class="down" onclick="moveCategory(${category.categoryId}, 'down')">下に移動</button>
                </div>
            </div>
        `;
        categoryList.appendChild(categoryDiv);

        const option = document.createElement('option');
        option.value = category.categoryName;
        option.textContent = `${category.categoryId} ${category.categoryName}`;
        categorySelect.appendChild(option);
    });
}

function toggleCategoryDisplay() {
    const categoryList = document.getElementById('categoryList');
    const categoryForm = document.getElementById('categoryForm');
    if (categoryList.style.display === 'none') {
        categoryList.style.display = 'block';
        categoryForm.style.display = 'flex';
    } else {
        categoryList.style.display = 'none';
        categoryForm.style.display = 'none';
    }
}

function deleteCategory(categoryId) {
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories = categories.filter(category => category.categoryId !== categoryId);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategories();
}

function moveCategory(categoryId, direction) {
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    const index = categories.findIndex(category => category.categoryId === categoryId);

    if (direction === 'up' && index > 0) {
        [categories[index - 1], categories[index]] = [categories[index], categories[index - 1]];
    } else if (direction === 'down' && index < categories.length - 1) {
        [categories[index + 1], categories[index]] = [categories[index], categories[index + 1]];
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategories();
}

document.getElementById('menuForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const menuName = document.getElementById('menuName').value;
    const categoryName = document.getElementById('menuCategoryName').value;
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value, 10);
    const menus = JSON.parse(localStorage.getItem('menus')) || [];

    const newMenu = {
        menuId: menus.length + 1,
        menuName,
        categoryName,
        price,
        stock
    };

    menus.push(newMenu);
    localStorage.setItem('menus', JSON.stringify(menus));
    loadMenus();
    document.getElementById('menuForm').reset();
});

function loadMenus() {
    const menus = JSON.parse(localStorage.getItem('menus')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const menuList = document.getElementById('menuList');
    menuList.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('menu-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>カテゴリ</th>
                <th>メニュー名</th>
                <th>金額</th>
                <th>残数</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    categories.forEach(category => {
        const categoryRow = document.createElement('tr');
        const categoryCell = document.createElement('td');
        categoryCell.colSpan = 5;
        categoryCell.classList.add('category-title');
        categoryCell.textContent = `[${category.categoryId}] ${category.categoryName}`;
        categoryRow.appendChild(categoryCell);
        tbody.appendChild(categoryRow);

        menus.filter(menu => menu.categoryName === category.categoryName)
            .forEach(menu => {
                const row = document.createElement('tr');
                row.setAttribute('data-menu-id', menu.menuId);
                row.innerHTML = `
                    <td>No.${menu.menuId}</td>
                    <td class="menu-cell">${menu.menuName}</td>
                    <td class="price-cell">${menu.price}</td>
                    <td class="stock-cell">${menu.stock}</td>
                    <td>
                        <button class="edit-button" onclick="editMenuItem(${menu.menuId}, '${menu.menuName}', '${menu.categoryName}', ${menu.price}, ${menu.stock})">編集</button>
                        <button onclick="deleteMenuItem(${menu.menuId})">削除</button>
                        <button class="up" onclick="moveMenuItem(${menu.menuId}, 'up')">↑</button>
                        <button class="down" onclick="moveMenuItem(${menu.menuId}, 'down')">↓</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
    });

    menuList.appendChild(table);
}

function editMenuItem(menuId, menuName, categoryName, price, stock) {
    const menus = JSON.parse(localStorage.getItem('menus')) || [];
    const row = document.querySelector(`tr[data-menu-id="${menuId}"]`);
    const menuCell = row.querySelector('.menu-cell');
    const priceCell = row.querySelector('.price-cell');
    const stockCell = row.querySelector('.stock-cell');
    const editButton = row.querySelector('.edit-button');

    menuCell.innerHTML = `<input type="text" value="${menuName}" class="edit-menu-input">`;
    priceCell.innerHTML = `<input type="number" value="${price}" class="edit-price-input">`;
    stockCell.innerHTML = `<input type="number" value="${stock}" class="edit-stock-input">`;

    editButton.textContent = "編集完了";
    editButton.onclick = function() {
        const newMenuName = menuCell.querySelector('.edit-menu-input').value;
        const newPrice = parseInt(priceCell.querySelector('.edit-price-input').value, 10);
        const newStock = parseInt(stockCell.querySelector('.edit-stock-input').value, 10);

        const menuIndex = menus.findIndex(menu => menu.menuId === menuId);
        menus[menuIndex] = {
            menuId,
            menuName: newMenuName,
            categoryName,
            price: newPrice,
            stock: newStock
        };

        localStorage.setItem('menus', JSON.stringify(menus));
        loadMenus();
    };
}

function deleteMenuItem(menuId) {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    menus = menus.filter(menu => menu.menuId !== menuId);
    localStorage.setItem('menus', JSON.stringify(menus));
    loadMenus();
}

function moveMenuItem(menuId, direction) {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    const index = menus.findIndex(menu => menu.menuId === menuId);

    if (direction === 'up' && index > 0) {
        [menus[index - 1], menus[index]] = [menus[index], menus[index - 1]];
    } else if (direction === 'down' && index < menus.length - 1) {
        [menus[index + 1], menus[index]] = [menus[index], menus[index + 1]];
    }

    localStorage.setItem('menus', JSON.stringify(menus));
    loadMenus();
}
