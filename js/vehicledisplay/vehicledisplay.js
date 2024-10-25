// 假設這是我們的車輛數據
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
    
    // 添加初始提示
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        filterSection.insertAdjacentHTML('afterbegin', '<div class="filter-hint">-</div>');
    }
});

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

    // 搜尋功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterVehicles);
    }
}

// 更新篩選狀態
function updateFilterStatus(filterId) {
    const filter = document.getElementById(filterId);
    if (filter) {
        const selectedOption = filter.options[filter.selectedIndex].text;
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
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加彈出視窗到頁面
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('vehicleModal');
        const closeButton = modal.querySelector('.close-button');

        // 顯示彈出視窗
        modal.style.display = 'block';

        // 關閉按鈕點擊事件
        closeButton.onclick = function() {
            modal.remove();
        }

        // 點擊彈出視窗外部區域關閉
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        }
    }
}

// 格式化價格
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 排序功能
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
    }
    updateVehicleDisplay(sortedVehicles);
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

// 添加錯誤處理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('錯誤: ' + msg + '\n網址: ' + url + '\n行號: ' + lineNo + '\n列號: ' + columnNo + '\n錯誤物件: ' + error);
    return false;
};