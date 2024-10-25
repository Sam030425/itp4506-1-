// 假設這是我們的車輛數據
const vehicles = [
    {
        id: 1,
        brand: 'toyota',
        model: 'Toyota Camry 2.5',
        year: 2024,
        mileage: 0,
        engine: '2.5L 直列四缸',
        price: 299800,
        type: 'sedan',
        image: '../images/car1.jpg'
    },
    {
        id: 2,
        brand: 'lexus',
        model: 'Lexus RX 350',
        year: 2024,
        mileage: 0,
        engine: '3.5L V6',
        price: 688000,
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
        brand: 'aston martin',
        model: 'Aston Martin',
        year: 2024,
        mileage: 0,
        engine: '2.0L VTEC Turbo',
        price: 458000,
        type: 'sports',
        image: '../images/car4.jpg'
    }
];

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    updateVehicleDisplay(vehicles);
});

// 初始化篩選器
function initializeFilters() {
    // 品牌篩選
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
        brandFilter.addEventListener('change', filterVehicles);
    }

    // 價格範圍篩選
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', filterVehicles);
    }

    // 車型篩選
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', filterVehicles);
    }

    // 搜尋功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterVehicles);
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

        // 品牌篩選
        if (brandFilter && brandFilter !== 'all') {
            matchesBrand = vehicle.brand === brandFilter;
        }

        // 價格範圍篩選
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

        // 車型篩選
        if (typeFilter && typeFilter !== 'all') {
            matchesType = vehicle.type === typeFilter;
        }

        // 搜尋詞篩選
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
                        onerror="this.style.display='none';this.parentElement.innerHTML='<div>NO IMG FOUND</div>';"
                    >
                </div>
                <div class="vehicle-info">
                    <h3>${vehicle.model}</h3>
                    <div class="vehicle-specs">
                        <p>年份：${vehicle.year}</p>
                        <p>里程：${vehicle.mileage} 公里</p>
                        <p>引擎：${vehicle.engine}</p>
                    </div>
                    <div class="vehicle-price">HK$${vehicle.price.toLocaleString()}</div>
                    <button class="detail-button" onclick="showVehicleDetails(${vehicle.id})">查看詳情</button>
                </div>
            </div>
        `).join('');
    }

    // 如果網格還沒有被添加到頁面中，則添加它
    const showcase = document.querySelector('.vehicle-showcase');
    if (showcase && !document.querySelector('.vehicles-grid')) {
        showcase.appendChild(vehiclesGrid);
    }
}

// 顯示車輛詳情
function showVehicleDetails(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        // 這裡可以實現跳轉到詳情頁面或顯示詳情模態框
        window.location.href = `/vehicles/${vehicleId}`;
        // 或者使用模態框顯示
        // showModal(vehicle);
    }
}

// 格式化價格
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 可選：添加排序功能
function sortVehicles(sortBy) {
    let sortedVehicles = [...vehicles];
    switch(sortBy) {
        case 'price-asc':
            sortedVehicles.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedVehicles.sort((a, b) => b.price - a.price);
            break;
        case 'year-desc':
            sortedVehicles.sort((a, b) => b.year - a.year);
            break;
        // 可以添加更多排序選項
    }
    updateVehicleDisplay(sortedVehicles);
}