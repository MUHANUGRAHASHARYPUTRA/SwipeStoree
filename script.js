
// ======================================================
//                  SCRIPT.JS FINAL (BERSIH & DIPERBAIKI)
// ======================================================

window.addEventListener('load', () => {

    // ------------------------------------------------------
    // 1. VARIABLE GLOBAL
    // ------------------------------------------------------
    let cart = [];
    let checkoutHistory = [];
    let demoBalance = 23000000;
    let productSelections = {}; // Store color and capacity selections per product
    let customProductSelections = {}; // Store custom product selections (color, ram, capacity)

    // ------------------------------------------------------
    // 1.5. LOCALSTORAGE FUNCTIONS
    // ------------------------------------------------------
    function saveToLocalStorage() {
        localStorage.setItem('demoBalance', demoBalance);
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('checkoutHistory', JSON.stringify(checkoutHistory));
        localStorage.setItem('productSelections', JSON.stringify(productSelections));
        localStorage.setItem('customProductSelections', JSON.stringify(customProductSelections));
    }

    function loadFromLocalStorage() {
        const savedBalance = localStorage.getItem('demoBalance');
        if (savedBalance !== null) {
            demoBalance = parseInt(savedBalance);
        }

        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }

        const savedHistory = localStorage.getItem('checkoutHistory');
        if (savedHistory) {
            checkoutHistory = JSON.parse(savedHistory);
        }

        const savedSelections = localStorage.getItem('productSelections');
        if (savedSelections) {
            productSelections = JSON.parse(savedSelections);
        }

        const savedCustomSelections = localStorage.getItem('customProductSelections');
        if (savedCustomSelections) {
            customProductSelections = JSON.parse(savedCustomSelections);
        }
    }

    // Load data saat halaman load
    loadFromLocalStorage();

    const els = {
        demoBalance: document.getElementById('demo-balance'),
        demoBalanceMobile: document.getElementById('demo-balance-mobile'),
        cartCount: document.getElementById('cart-count'),
        cartModal: document.getElementById('cart-modal'),
        cartButton: document.getElementById('cart-button'),
        cartItems: document.getElementById('cart-items'),
        cartTotal: document.getElementById('cart-total'),
        checkoutButton: document.getElementById('checkout-button'),
        productDetailModal: document.getElementById('product-detail-modal'),
        mobileQuery: window.matchMedia('(max-width: 768px)')
    };

    // Update mobile balance display based on page
    function updateMobileBalance() {
        if (els.demoBalanceMobile) {
            const currentBalance = els.demoBalance ? els.demoBalance.textContent : rupiah(demoBalance);
            els.demoBalanceMobile.textContent = currentBalance;
        }
    }

    // ------------------------------------------------------
    // 2. FORMAT RUPIAH
    // ------------------------------------------------------
    const rupiah = (n) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(n);

    els.demoBalance.textContent = rupiah(demoBalance);
    updateMobileBalance();

    // ------------------------------------------------------
    // 3. NOTIFIKASI
    // ------------------------------------------------------
    function notify(msg) {
        let n = document.getElementById('premium-notification');
        if (!n) {
            n = document.createElement('div');
            n.id = 'premium-notification';
            document.body.appendChild(n);
        }

        n.textContent = msg;
        n.style.opacity = 1;
        n.style.transform = (window.innerWidth <= 768)
            ? 'translateX(-50%) translateY(0)'
            : 'translateY(0)';

        setTimeout(() => {
            n.style.opacity = 0;
            n.style.transform = (window.innerWidth <= 768)
                ? 'translateX(-50%) translateY(-20px)'
                : 'translateY(-20px)';
        }, 1800);
    }

    // ------------------------------------------------------
    // 4. KERANJANG
    // ------------------------------------------------------
    function updateCartCount() {
        els.cartCount.textContent = cart.reduce((a, b) => a + b.quantity, 0);
    }

    function updateCartModal() {
        const wrap = els.cartItems;
        wrap.innerHTML = '';
        let total = 0;

        // --- Riwayat Checkout ---
        if (checkoutHistory.length > 0) {
            const h = document.createElement('div');
            h.innerHTML = `<h3 style="color:#D4AF37">Riwayat Checkout</h3>`;
            wrap.appendChild(h);

            checkoutHistory.forEach((group, n) => {
                const block = document.createElement('div');
                block.className = 'checkout-history';
                block.innerHTML = `<h4>Checkout ${n + 1}</h4>`;

                group.forEach(item => {
                    let displayName = item.name;
                    if (item.color && item.capacity) {
                        if (item.ram) {
                            displayName += ` (${item.color}, ${item.ram}, ${item.capacity})`;
                        } else {
                            displayName += ` (${item.color}, ${item.capacity})`;
                        }
                    }
                    block.innerHTML += `
                        <p><strong>${displayName}</strong> —
                        ${rupiah(item.price)} × ${item.quantity} =
                        <strong>${rupiah(item.price * item.quantity)}</strong>
                        </p>`;
                });

                wrap.appendChild(block);
            });

            wrap.appendChild(document.createElement('hr'));
        }

        // --- Keranjang Kosong ---
        if (cart.length === 0) {
            wrap.innerHTML += `<p style="text-align:center;color:#555">Keranjang kosong.</p>`;
            els.cartTotal.textContent = rupiah(0);
            els.checkoutButton.disabled = true;
            return;
        }

        // --- Keranjang Saat Ini ---
        wrap.innerHTML += `<h3>Keranjang Saat Ini</h3>`;
        els.checkoutButton.disabled = false;

        cart.forEach((item, idx) => {
            const line = document.createElement('div');
            const subtotal = item.price * item.quantity;
            total += subtotal;

            let displayName = item.name;
            if (item.color && item.capacity) {
                displayName += ` (${item.color}, ${item.capacity})`;
            }

            line.className = 'cart-item-detail';
            line.innerHTML = `
                <p><strong>${displayName}</strong></p>
                <p>${rupiah(item.price)} × ${item.quantity} =
                   <strong>${rupiah(subtotal)}</strong></p>
                <button class="remove-item" data-idx="${idx}">Hapus</button>
            `;
            wrap.appendChild(line);
        });

        els.cartTotal.textContent = rupiah(total);

        // tombol hapus
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.onclick = () => {
                cart.splice(btn.dataset.idx, 1);
                updateCartCount();
                updateCartModal();
                // Simpan cart ke localStorage setelah remove item
                saveToLocalStorage();
            };
        });
    }

    // ------------------------------------------------------
    // 5. MODAL KERANJANG
    // ------------------------------------------------------
    els.cartButton.onclick = () => {
        updateCartModal();
        els.cartModal.style.display = 'flex';
        requestAnimationFrame(() => {
            els.cartModal.style.opacity = 1;
        });
    };

    document.querySelectorAll('.close-button').forEach(btn => {
        btn.onclick = () => {
            els.cartModal.style.opacity = 0;
            setTimeout(() => els.cartModal.style.display = 'none', 350);
        };
    });

    window.onclick = (e) => {
        if (e.target === els.cartModal) {
            els.cartModal.style.opacity = 0;
            setTimeout(() => els.cartModal.style.display = 'none', 350);
        }
    };

    // ------------------------------------------------------
    // 6. HAMBURGER NAV
    // ------------------------------------------------------
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger-menu');

    function refreshNav() {
        if (els.mobileQuery.matches) {
            navMenu.style.display = 'none';
            navMenu.classList.remove('open');
        } else {
            navMenu.style.display = 'flex';
            navMenu.classList.remove('open');
        }
    }

    refreshNav();
    window.addEventListener('resize', refreshNav);

    hamburger.onclick = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
    };

    // tutup nav saat klik item
    navMenu.querySelectorAll('a').forEach(a => {
        a.onclick = () => {
            if (els.mobileQuery.matches) {
                navMenu.classList.remove('open');
                hamburger.classList.remove('active');
            }
        };
    });

    // ------------------------------------------------------
    // 7. ADD TO CART
    // ------------------------------------------------------
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = () => {
            const card = btn.closest('.product-card');
            const id = card.dataset.productId;
            const price = parseInt(card.dataset.price);
            const name = card.querySelector('h3').textContent;

            const exist = cart.find(i => i.id === id);

            if (exist) exist.quantity++;
            else cart.push({ id, name, price, quantity: 1 });

            updateCartCount();
            notify(`"${name}" ditambahkan ke keranjang`);
        };
    });

    // ------------------------------------------------------
    // 8. SLIDER UNIVERSAL (dipakai di semua gallery)
    // ------------------------------------------------------
    function createSlider(container, thumbs, desc, btnPrev, btnNext) {
        const slides = container.children;
        if (!slides.length) return;

        let index = 0;
        let startX = 0;
        let dragging = false;

        function go(i) {
            if (i < 0) i = slides.length - 1;
            if (i >= slides.length) i = 0;
            index = i;

            container.style.transform = `translateX(-${100 * index}%)`;

            if (desc) desc.textContent = slides[index].dataset.description || '';

            if (thumbs) {
                thumbs.forEach(t => t.classList.remove('active-thumb'));
                thumbs[index]?.classList.add('active-thumb');
            }
        }

        // tombol
        if (btnPrev) {
            btnPrev.onclick = () => go(index - 1);
        }
        if (btnNext) {
            btnNext.onclick = () => go(index + 1);
        }

        // thumbnail
        thumbs?.forEach((t, i) => t.onclick = () => go(i));

        // swipe mobile
        container.addEventListener('touchstart', (e) => {
            dragging = true;
            startX = e.touches[0].clientX;
            container.style.transition = 'none';
        });

        container.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            const x = e.touches[0].clientX - startX;
            container.style.transform = `translateX(calc(-${index * 100}% + ${x}px))`;
        });

        container.addEventListener('touchend', (e) => {
            dragging = false;
            container.style.transition = '0.4s ease';

            const x = e.changedTouches[0].clientX - startX;

            if (Math.abs(x) > 50) go(index + (x < 0 ? 1 : -1));
            else go(index);
        });

        go(0);
    }

    // aktifkan slider di tiap kartu produk
    document.querySelectorAll('.product-card').forEach(card => {
        createSlider(
            card.querySelector('.image-gallery'),
            [...card.querySelectorAll('.thumb-container img')],
            card.querySelector('.image-description-display'),
            card.querySelector('.slider-nav.prev'),
            card.querySelector('.slider-nav.next')
        );
    });

    // ------------------------------------------------------
    // 9. PRODUK DETAIL MODAL (galeri dipakai ulang)
    // ------------------------------------------------------
    document.querySelectorAll('.view-detail').forEach(btn => {
        btn.onclick = () => {
            const card = btn.closest('.product-card');

            const name = card.querySelector('h3').textContent;
            const price = parseInt(card.dataset.price);
            const slides = [...card.querySelectorAll('.slide')];

            // Isi modal
            document.getElementById('product-detail-title').textContent = name;
            document.getElementById('product-detail-price').textContent = rupiah(price);

            const wrap = document.getElementById('product-detail-images');
            wrap.innerHTML = '';
            slides.forEach(s => wrap.appendChild(s.cloneNode(true)));

            // buka modal
            els.productDetailModal.style.display = 'flex';
            els.productDetailModal.style.opacity = 0;

            requestAnimationFrame(() => {
                els.productDetailModal.style.opacity = 1;
            });

            // aktifkan slider modal
            createSlider(
                wrap,
                null,
                null,
                document.querySelector('#product-detail-modal .prev'),
                document.querySelector('#product-detail-modal .next')
            );
        };
    });

    // tutup modal detail
    document.querySelector('#product-detail-modal .close-button').onclick = () => {
        els.productDetailModal.style.opacity = 0;
        setTimeout(() => els.productDetailModal.style.display = 'none', 350);
    };

    // ------------------------------------------------------
    // 10. CHECKOUT
    // ------------------------------------------------------
    els.checkoutButton.onclick = () => {
        const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);

        if (demoBalance < total)
            return notify(`Saldo ${rupiah(demoBalance)} tidak cukup!`);

        demoBalance -= total;
        els.demoBalance.textContent = rupiah(demoBalance);
        updateMobileBalance();

        checkoutHistory.push([...cart]);
        cart = [];
        updateCartCount();
        updateCartModal();

        // Simpan ke localStorage setelah checkout
        saveToLocalStorage();

        notify(`Checkout sukses!`);
    };

    // ------------------------------------------------------
    // 11. COLOR AND CAPACITY SELECTION LOGIC
    // ------------------------------------------------------
    function initializeProductSelections() {
        document.querySelectorAll('.apple-product').forEach(product => {
            const productId = product.dataset.appleId;
            const basePrice = parseInt(product.dataset.basePrice);

            // Initialize selections if not exists
            if (!productSelections[productId]) {
                productSelections[productId] = {
                    color: 'Space Gray',
                    capacity: '128 GB',
                    price: basePrice
                };
            }

            // Update price display
            updatePriceDisplay(productId);
        });
    }

    function updatePriceDisplay(productId) {
        const selection = productSelections[productId];
        if (!selection) return;

        const priceDisplay = document.getElementById(`price-display-${productId}`);
        if (priceDisplay) {
            priceDisplay.textContent = `Harga: ${rupiah(selection.price)}`;
        }
    }

    // Color selection logic
    document.querySelectorAll('.color-circle').forEach(circle => {
        circle.addEventListener('click', function() {
            const productId = this.closest('.color-options').dataset.productId;
            const color = this.dataset.color;

            // Update selection
            productSelections[productId].color = color;

            // Update UI
            document.querySelectorAll(`.color-options[data-product-id="${productId}"] .color-circle`).forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            // Update display name
            const displayName = document.getElementById(`selected-color-name-${productId}`);
            if (displayName) {
                displayName.textContent = color;
            }

            // Save to localStorage
            saveToLocalStorage();

            console.log(`Warna dipilih untuk ${productId}:`, color);
        });
    });

    // Capacity selection logic
    document.querySelectorAll('.capacity-box').forEach(box => {
        box.addEventListener('click', function() {
            const productId = this.closest('.capacity-options').dataset.productId;
            const capacity = this.dataset.capacity;
            const basePrice = parseInt(document.querySelector(`[data-apple-id="${productId}"]`).dataset.basePrice);

            // Calculate new price
            const priceCalculator = new ProductPrice(basePrice);
            const newPrice = priceCalculator.calculatePrice(capacity);

            // Update selection
            productSelections[productId].capacity = capacity;
            productSelections[productId].price = newPrice;

            // Update UI
            document.querySelectorAll(`.capacity-options[data-product-id="${productId}"] .capacity-box`).forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');

            // Update price display
            updatePriceDisplay(productId);

            // Save to localStorage
            saveToLocalStorage();

            console.log(`Kapasitas dipilih untuk ${productId}:`, capacity, `Harga:`, rupiah(newPrice));
        });
    });

    // ------------------------------------------------------
    // 12. APPLE PRODUCTS BUY BUTTON
    // ------------------------------------------------------
    let currentAppleProduct = null;

    document.querySelectorAll('.apple-buy-btn').forEach(btn => {
        btn.onclick = () => {
            const product = btn.closest('.apple-product');
            const name = product.querySelector('.apple-title').textContent;
            const id = product.dataset.appleId;

            // Get current selections
            const selection = productSelections[id];
            if (!selection) {
                notify('Silakan pilih warna dan kapasitas terlebih dahulu');
                return;
            }

            currentAppleProduct = {
                id,
                name,
                price: selection.price,
                color: selection.color,
                capacity: selection.capacity
            };

            document.getElementById('apple-product-name').textContent = `${name} (${selection.color}, ${selection.capacity})`;
            document.getElementById('apple-product-price').textContent = rupiah(selection.price);
            document.getElementById('apple-quantity').textContent = '1';

            document.getElementById('apple-quantity-modal').style.display = 'flex';
            requestAnimationFrame(() => {
                document.getElementById('apple-quantity-modal').style.opacity = 1;
            });
        };
    });

    // Quantity controls
    document.getElementById('increase-qty').onclick = () => {
        const qtyEl = document.getElementById('apple-quantity');
        let qty = parseInt(qtyEl.textContent);
        qtyEl.textContent = qty + 1;
    };

    document.getElementById('decrease-qty').onclick = () => {
        const qtyEl = document.getElementById('apple-quantity');
        let qty = parseInt(qtyEl.textContent);
        if (qty > 1) qtyEl.textContent = qty - 1;
    };

    // Confirm add to cart
    document.getElementById('confirm-apple-add').onclick = () => {
        if (!currentAppleProduct) return;

        const quantity = parseInt(document.getElementById('apple-quantity').textContent);

        // Create unique ID that includes color and capacity
        const uniqueId = `${currentAppleProduct.id}-${currentAppleProduct.color}-${currentAppleProduct.capacity}`;

        const exist = cart.find(i => i.uniqueId === uniqueId);

        if (exist) {
            exist.quantity += quantity;
        } else {
            cart.push({
                id: currentAppleProduct.id,
                uniqueId: uniqueId,
                name: currentAppleProduct.name,
                price: currentAppleProduct.price,
                quantity: quantity,
                color: currentAppleProduct.color,
                capacity: currentAppleProduct.capacity
            });
        }

        updateCartCount();
        // Simpan cart ke localStorage setelah add to cart
        saveToLocalStorage();
        notify(`"${currentAppleProduct.name} (${currentAppleProduct.color}, ${currentAppleProduct.capacity})" (${quantity}x) ditambahkan ke keranjang`);

        // Close modal
        document.getElementById('apple-quantity-modal').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('apple-quantity-modal').style.display = 'none';
        }, 350);
    };

    // Close apple quantity modal
    document.querySelector('#apple-quantity-modal .close-button').onclick = () => {
        document.getElementById('apple-quantity-modal').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('apple-quantity-modal').style.display = 'none';
        }, 350);
    };

    window.onclick = (e) => {
        const appleModal = document.getElementById('apple-quantity-modal');
        if (e.target === appleModal) {
            appleModal.style.opacity = 0;
            setTimeout(() => appleModal.style.display = 'none', 350);
        }
    };

    // ------------------------------------------------------
    // 13. CUSTOM PRODUCT SELECTION LOGIC
    // ------------------------------------------------------
    // script.js: Di dalam fungsi initializeCustomProductSelections()
function initializeCustomProductSelections() {
    document.querySelectorAll('.custom-product-card').forEach(product => {
        const productId = product.dataset.productId;
        const basePrice = parseInt(product.dataset.basePrice);

        // ... (Logika Inisialisasi customProductSelections[productId] tetap sama) ...

        if (!customProductSelections[productId]) {
            customProductSelections[productId] = {
                color: 'Space Gray',
                capacity: '128 GB',
                price: basePrice
            };
        }

        // --- TAMBAHKAN LOGIKA INI UNTUK RECALCULATE PRICE SAAT LOAD ---
        // Recalculate price based on current multipliers to ensure updated prices
        const priceCalculator = new ProductPrice(basePrice);
        customProductSelections[productId].price = priceCalculator.calculatePriceForIPadAir13(customProductSelections[productId].capacity);
        // --------------------------------------------------------

        // --- TAMBAHKAN LOGIKA INI UNTUK UPDATE UI SAAT LOAD ---
        const currentCapacity = customProductSelections[productId].capacity;
        const capacityBoxes = document.querySelectorAll(`.custom-capacity-options[data-product-id="${productId}"] .custom-capacity-box`);

        capacityBoxes.forEach(box => {
            box.classList.remove('selected');
            if (box.dataset.capacity === currentCapacity) {
                box.classList.add('selected');
                // Pastikan display name juga di update saat load
                const displayName = document.getElementById(`custom-selected-capacity-${productId}`);
                if (displayName) {
                    displayName.textContent = currentCapacity;
                }
            }
        });
        // --------------------------------------------------------

        // Update price display
        updateCustomPriceDisplay(productId);
    });
}

    function updateCustomPriceDisplay(productId) {
        const selection = customProductSelections[productId];
        if (!selection) return;

        const priceDisplay = document.getElementById(`custom-price-display-${productId}`);
        if (priceDisplay) {
            priceDisplay.textContent = `Harga: ${rupiah(selection.price)}`;
        }
    }

    // Custom color selection logic
    document.querySelectorAll('.custom-color-circle').forEach(circle => {
        circle.addEventListener('click', function() {
            const productId = this.closest('.custom-color-options').dataset.productId;
            const color = this.dataset.color;

            // Update selection
            customProductSelections[productId].color = color;

            // Update UI
            document.querySelectorAll(`.custom-color-options[data-product-id="${productId}"] .custom-color-circle`).forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            // Update display name
            const displayName = document.getElementById(`custom-selected-color-${productId}`);
            if (displayName) {
                displayName.textContent = color;
            }

            // Save to localStorage
            saveToLocalStorage();

            console.log(`Warna custom dipilih untuk ${productId}:`, color);
        });
    });



    // Custom capacity selection logic - KODE YANG SUDAH DIPERBAIKI
// script.js - Custom capacity selection logic (Ganti seluruh blok ini)
document.querySelectorAll('.custom-capacity-box').forEach(box => {
    box.addEventListener('click', function() {
        
        // --- 1. Ambil Referensi Card untuk data yang aman ---
        const productCard = this.closest('.custom-product-card');
        if (!productCard) return; // Pengamanan

        const productId = productCard.dataset.productId;
        const basePrice = parseInt(productCard.dataset.basePrice); // AMBIL DARI productCard BUKAN document.querySelector
        const capacity = this.dataset.capacity;
        
        if (isNaN(basePrice)) {
            console.error("DEBUG: Base Price tidak valid. Gagal kalkulasi harga.");
            return;
        }

        // --- 2. Kalkulasi Harga ---
        const priceCalculator = new ProductPrice(basePrice);
        let newPrice = priceCalculator.calculatePriceForIPadAir13(capacity);
        
        // Fallback jika newPrice tidak valid (Walaupun prices.js sudah benar)
        if (isNaN(newPrice)) {
            newPrice = basePrice;
        }

        // --- 3. Update Data Model ---
        customProductSelections[productId].capacity = capacity;
        customProductSelections[productId].price = newPrice;

        // --- 4. Update UI: Hapus 'selected' dari semua di dalam container ini ---
        // Kita bisa ambil container dari parent-nya custom-capacity-box
        const capacityOptionsContainer = this.closest('.custom-capacity-options');

        capacityOptionsContainer.querySelectorAll('.custom-capacity-box').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');

        // Update display name
        const displayName = document.getElementById(`custom-selected-capacity-${productId}`);
        if (displayName) {
            displayName.textContent = capacity;
        }

        // Update price display
        updateCustomPriceDisplay(productId);

        // Save to localStorage
        saveToLocalStorage();

        console.log(`✅ Klik Berhasil: Kapasitas custom dipilih untuk ${productId} (${capacity}), Harga: ${rupiah(newPrice)}`);
    });
});

    // Custom add to cart logic
    document.querySelectorAll('.custom-add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const selection = customProductSelections[productId];

            if (!selection) {
                notify('Silakan pilih konfigurasi terlebih dahulu');
                return;
            }

            const productCard = this.closest('.custom-product-card');
            const productName = productCard.querySelector('h3').textContent;

            // Create unique ID that includes color and capacity only
            const uniqueId = `${productId}-${selection.color}-${selection.capacity}`;

            const exist = cart.find(i => i.uniqueId === uniqueId);

            if (exist) {
                exist.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    uniqueId: uniqueId,
                    name: productName,
                    price: selection.price,
                    quantity: 1,
                    color: selection.color,
                    capacity: selection.capacity
                });
            }

            updateCartCount();
            saveToLocalStorage();
            notify(`"${productName} (${selection.color}, ${selection.capacity})" ditambahkan ke keranjang`);

            console.log(`Custom product added:`, selection);
        });
    });

    // ------------------------------------------------------
    // 14. INITIALIZE PRODUCT SELECTIONS
    // ------------------------------------------------------
    initializeProductSelections();
    initializeCustomProductSelections();

    // ------------------------------------------------------
    // 15. PRODUK UNGGULAN SLIDER
    // ------------------------------------------------------
    function initProdukUnggulanSlider() {
        const container = document.querySelector('.produk-unggulan-section .slider-images');
        const prevBtn = document.querySelector('.produk-unggulan-section .slider-nav.prev');
        const nextBtn = document.querySelector('.produk-unggulan-section .slider-nav.next');
        const dots = document.querySelectorAll('.produk-unggulan-section .dot');

        if (!container) return;

        const slides = container.children;
        let currentIndex = 0;
        let startX = 0;
        let isDragging = false;

        function updateSlider() {
            container.style.transform = `translateX(-${currentIndex * 20}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            if (currentIndex < 0) currentIndex = slides.length - 1;
            if (currentIndex >= slides.length) currentIndex = 0;
            updateSlider();
        }

        // Navigation buttons
        if (prevBtn) {
            prevBtn.onclick = () => goToSlide(currentIndex - 1);
        }
        if (nextBtn) {
            nextBtn.onclick = () => goToSlide(currentIndex + 1);
        }

        // Dots navigation
        dots.forEach((dot, index) => {
            dot.onclick = () => goToSlide(index);
        });

        // Touch/swipe support
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            container.style.transition = 'none';
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            const translateX = -(currentIndex * 20) - (diff / container.offsetWidth * 20);
            container.style.transform = `translateX(${translateX}%)`;
        });

        container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            container.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentIndex + 1);
                } else {
                    goToSlide(currentIndex - 1);
                }
            } else {
                updateSlider();
            }
        });

        // Auto-play (optional)
        let autoPlayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);

        // Pause on hover
        const sliderWrapper = document.querySelector('.produk-unggulan-section .slider-wrapper');
        if (sliderWrapper) {
            sliderWrapper.addEventListener('mouseenter', () => {
                clearInterval(autoPlayInterval);
            });
            sliderWrapper.addEventListener('mouseleave', () => {
                autoPlayInterval = setInterval(() => {
                    goToSlide(currentIndex + 1);
                }, 5000);
            });
        }

        updateSlider();
    }

    initProdukUnggulanSlider();

    // ------------------------------------------------------
    // 13. SCROLL REVEAL (satu kali saja)
    // ------------------------------------------------------
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('is-visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll, .section-title')
        .forEach(el => revealObs.observe(el));



        
})