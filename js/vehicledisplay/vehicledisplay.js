// 車輛數據
const vehicles = [
    {
        id: 1,
        brand: 'toyota',
        model: 'Toyota Camry 2.5',
        year: 2017,
        mileage: 0,
        engine: '2.5 L 2AR-FE',
        price: 238000,
        type: 'sedan',
        image: '../images/car1.jpg'
    },
    {
        id: 2,
        brand: 'lexus',
        model: 'Lexus RX 350',
        year: 2021,
        mileage: 0,
        engine: '3.5 L 2GR-FKS V6',
        price: 89469,
        type: 'suv',
        image: '../images/car2.jpg'
    },
    {
        id: 3,
        brand: 'honda',
        model: 'Honda Civic Type R',
        year: 2024,
        mileage: 0,
        engine: '2.0L VTEC Turbo',
        price: 458000,
        type: 'sedan',
        image: '../images/car3.jpg'
    },
    {
        id: 4,
        brand: 'honda',
        model: 'Honda Civic Type R',
        year: 2022,
        mileage: 0,
        engine: '2.0 L K20C1 turbocharged I4',
        price: 558000,
        type: 'sedan',
        image: '../images/car4.jpg'
    },
    {
        id: 5,
        brand: 'aston martin',
        model: 'Aston Martin Valkyrie',
        year: 2017,
        mileage: 0,
        engine: '6.5 litre Aston Martin-V12',
        price: 27194921,
        type: 'sports',
        image: '../images/car5.jpg'
    }
];

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    updateVehicleDisplay(vehicles);
    checkLoginStatus();
    
    // 添加初始提示
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        filterSection.insertAdjacentHTML('afterbegin', '<div class="filter-hint">-</div>');
    }
});

// 檢查登入狀態
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    updateUserInterface(currentUser);
}

// 更新用戶界面
function updateUserInterface(currentUser) {
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    if (currentUser) {
        navRight.innerHTML = `
            <div class="user-section">
                <div class="user-info">
                    <span class="user-name">${currentUser.name}</span>
                    <span class="dropdown-arrow">▼</span>
                </div>
                <div class="user-menu">
                    <a href="profile.html" class="user-menu-item">Profile</a>
                    <a href="orders.html" class="user-menu-item">Orders</a>
                    <button onclick="logout()" class="logout-btn">Logout</button>
                </div>
            </div>
            <div class="cart-section">
                <a href="#" class="cart-icon" onclick="showCart(event)">
                    🛒
                    <span class="cart-count">0</span>
                </a>
            </div>
        `;

        cart.updateCartCount();
    } else {
        navRight.innerHTML = `
            <a href="login.html" class="login-btn">Login</a>
        `;
    }
}

// 初始化篩選器
function initializeFilters() {
    const filters = ['brandFilter', 'priceFilter', 'typeFilter'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', () => {
                filterVehicles();
                updateFilterStatus(filterId);
            });
        }
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterVehicles);
    }
}

// 更新篩選狀態
function updateFilterStatus(filterId) {
    const filter = document.getElementById(filterId);
    if (filter) {
        filter.style.borderColor = filter.value === 'all' ? '#ddd' : '#4CAF50';
    }
}

// 篩選車輛
function filterVehicles() {
    const brandFilter = document.getElementById('brandFilter')?.value;
    const priceFilter = document.getElementById('priceFilter')?.value;
    const typeFilter = document.getElementById('typeFilter')?.value;
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();

    let filteredVehicles = vehicles.filter(vehicle => {
        let matchesBrand = true;
        let matchesPrice = true;
        let matchesType = true;
        let matchesSearch = true;

        if (brandFilter && brandFilter !== 'all') {
            matchesBrand = vehicle.brand === brandFilter;
        }

        if (priceFilter && priceFilter !== 'all') {
            switch (priceFilter) {
                case 'under300':
                    matchesPrice = vehicle.price <= 300000;
                    break;
                case '300to600':
                    matchesPrice = vehicle.price > 300000 && vehicle.price <= 600000;
                    break;
                case 'above600':
                    matchesPrice = vehicle.price > 600000;
                    break;
            }
        }

        if (typeFilter && typeFilter !== 'all') {
            matchesType = vehicle.type === typeFilter;
        }

        if (searchTerm) {
            matchesSearch = vehicle.model.toLowerCase().includes(searchTerm) ||
                           vehicle.brand.toLowerCase().includes(searchTerm);
        }

        return matchesBrand && matchesPrice && matchesType && matchesSearch;
    });

    updateVehicleDisplay(filteredVehicles);
}

// 更新車輛展示
function updateVehicleDisplay(vehicles) {
    const vehiclesGrid = document.querySelector('.vehicles-grid') || document.createElement('div');
    vehiclesGrid.className = 'vehicles-grid';
    
    if (vehicles.length === 0) {
        vehiclesGrid.innerHTML = `
            <div class="no-results">
                <p>沒有找到符合條件的車輛</p>
            </div>
        `;
    } else {
        vehiclesGrid.innerHTML = vehicles.map(vehicle => `
            <div class="vehicle-card">
                <div class="vehicle-image">
                    <img 
                        src="${vehicle.image}" 
                        alt="${vehicle.model}"
                        onerror="this.style.display='none';this.parentElement.innerHTML='<div>Image Not Found</div>';"
                    >
                </div>
                <div class="vehicle-info">
                    <h3>${vehicle.model}</h3>
                    <div class="vehicle-specs">
                        <p>Year：${vehicle.year}</p>
                        <p>Mileage：${vehicle.mileage} Kilometer</p>
                        <p>Engine：${vehicle.engine}</p>
                    </div>
                    <div class="vehicle-price">HK$${vehicle.price.toLocaleString()}</div>
                    <button class="detail-button" onclick="showVehicleDetails(${vehicle.id})">Details</button>
                </div>
            </div>
        `).join('');
    }

    const showcase = document.querySelector('.vehicle-showcase');
    if (showcase && !document.querySelector('.vehicles-grid')) {
        showcase.appendChild(vehiclesGrid);
    }
}

// 顯示車輛詳情
function showVehicleDetails(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        let actionButtons = '';
        if (currentUser && currentUser.userType && currentUser.userType.toLowerCase() === 'customer') {
            actionButtons = `
                <div class="action-buttons">
                    <button onclick="handleAddToCart(${vehicle.id})" class="cart-button">Add to Cart</button>
                    <button onclick="handleBuyNow(${vehicle.id})" class="buy-button">Buy Now</button>
                </div>
            `;
        } else if (currentUser && currentUser.userType && currentUser.userType.toLowerCase() !== 'customer') {
            actionButtons = `<p class="notice">Only customers can make purchases</p>`;
        } else {
            actionButtons = `<a href="../html/login.html" class="buy-button">Login to Purchase</a>`;
        }

        const modalHtml = `
            <div id="vehicleModal" class="modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <div class="modal-header">
                        <h2>${vehicle.model}</h2>
                    </div>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img 
                                src="${vehicle.image}" 
                                alt="${vehicle.model}"
                                onerror="this.style.display='none';this.parentElement.innerHTML='<div>Image Not Found</div>';"
                            >
                        </div>
                        <div class="vehicle-details">
                            <h3>Vehicle Specifications</h3>
                            <p>Brand：${vehicle.brand.toUpperCase()}</p>
                            <p>Year：${vehicle.year}</p>
                            <p>Mileage：${vehicle.mileage} Kilometer</p>
                            <p>Engine：${vehicle.engine}</p>
                            <p>Type：${vehicle.type.toUpperCase()}</p>
                            <div class="price-tag">Price：HK$${vehicle.price.toLocaleString()}</div>
                            ${actionButtons}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('vehicleModal');
        const closeButton = modal.querySelector('.close-button');

        modal.style.display = 'block';

        closeButton.onclick = function() {
            modal.remove();
        }

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        }
    }
}

// 處理加入購物車
function handleAddToCart(vehicleId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../html/login.html';
        return;
    }

    if (currentUser.userType.toLowerCase() !== 'customer') {
        showMessage('Only customers can make purchases', 'error');
        return;
    }

    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        cart.addItem(vehicle);
        const modal = document.getElementById('vehicleModal');
        if (modal) {
            modal.remove();
        }
    }
}

// 處理立即購買
function handleBuyNow(vehicleId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = '../html/login.html';
        return;
    }

    if (currentUser.userType.toLowerCase() !== 'customer') {
        showMessage('Only customers can make purchases', 'error');
        return;
    }

    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        cart.items = [];
        cart.addItem(vehicle);
        window.location.href = '../html/checkout.html';
    }
}

// 顯示消息提示
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    `;

    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#28a745';
            break;
        case 'warning':
            messageDiv.style.backgroundColor = '#ffc107';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#dc3545';
            break;
        default:
            messageDiv.style.backgroundColor = '#17a2b8';
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 登出函數
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    window.location.href = 'login.html';
}

// 重置所有篩選器
function resetFilters() {
    const filters = ['brandFilter', 'priceFilter', 'typeFilter'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = 'all';
            filter.style.borderColor = '#ddd';
        }
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    updateVehicleDisplay(vehicles);
}

// 錯誤處理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('錯誤: ' + msg + '\n網址: ' + url + '\n行號: ' + lineNo + '\n列號: ' + columnNo + '\n錯誤物件: ' + error);
    return false;
};