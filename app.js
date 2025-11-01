// Wrap all code in an IIFE to avoid polluting the global scope
(function() {
    document.addEventListener('DOMContentLoaded', () => {

        // --- STATE AND CONFIGURATION ---
        const API_KEY = ""; // Placeholder for Gemini API Key
        let currentLang = 'th'; // Default language
        let distributionChartInstance = null;
        let burnChart = null;

        // Chart color configs
        const chartColors = {
            textColor: '#6b7280',
            gridColor: 'rgba(0, 0, 0, 0.1)'
        };

        // Dedicated text map for the main dropdown button
        const LANG_BUTTON_TEXT = {
            th: 'TH - ไทย',
            en: 'EN - English',
            zh: 'CN - 中文'
        };

        // Data structure for flag images
        const LANG_FLAG_URLS = {
            th: "https://flagcdn.com/w160/th.png", // Thai Flag
            en: "https://flagcdn.com/w160/gb.png", // UK Flag
            zh: "https://flagcdn.com/w160/cn.png"  // China Flag
        };

        const nftData = {
            "Flash 1": { cost: 10, return: 40 },
            "Flash 2": { cost: 20, return: 80 },
            "Flash 3": { cost: 40, return: 160 },
            "Flash 4": { cost: 80, return: 320 },
            "Flash 5": { cost: 150, return: 600 },
            "Flash 6": { cost: 250, return: 1000 },
            "Flash 7": { cost: 450, return: 1800 },
            "Flash 8": { cost: 800, return: 3200 },
            "Flash 9": { cost: 1400, return: 5600 },
            "Flash 10": { cost: 2500, return: 10000 },
            "Flash 11": { cost: 3500, return: 14000 },
            "Flash 12": { cost: 5000, return: 20000 },
            "Flash 13": { cost: 10000, return: 40000 }
        };

        // --- LANGUAGE AND CONTENT FUNCTIONS ---

        function setLanguage(lang) {
            currentLang = lang;
            document.documentElement.lang = lang; // Set the lang attribute on the <html> tag

            // Update all text elements with data-key
            document.querySelectorAll('[data-key]').forEach(element => {
                const key = element.getAttribute('data-key');
                const text = LANG_DATA[lang][key];

                if (text) {
                    // Use innerHTML for keys that might contain <br> or <b> tags
                    if (text.includes('**') || text.includes('<br>')) {
                        element.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    } else {
                        element.innerText = text;
                    }

                    if (key === 'appTitle') {
                        document.title = text;
                    }
                }
            });

            updateLanguageDropdownUI(lang);
            updateAllCharts();
        }

        function updateLanguageDropdownUI(lang) {
            const currentLangTextEl = document.getElementById('current-lang-text');
            const currentFlagImgEl = document.getElementById('current-flag');

            const buttonDisplayText = LANG_BUTTON_TEXT[lang];
            const flagUrl = LANG_FLAG_URLS[lang];

            if (currentLangTextEl && buttonDisplayText && currentFlagImgEl) {
                currentLangTextEl.innerText = buttonDisplayText;
                currentFlagImgEl.src = flagUrl;
                currentFlagImgEl.alt = `${lang} flag`;
            }
        }

        // --- CHART CREATION AND UPDATE FUNCTIONS ---

        function updateAllCharts() {
            createDistributionChart();
            createBurnChart(calculateBurnData(true)); // Recreate burn chart with initial data
        }

        function createDistributionChart() {
            if (distributionChartInstance) {
                distributionChartInstance.destroy();
            }

            const labels = [
                LANG_DATA[currentLang].distributionLabel1 || 'Community / Airdrop',
                LANG_DATA[currentLang].distributionLabel2 || 'Initial Liquidity',
                LANG_DATA[currentLang].distributionLabel3 || 'Team / Development',
                LANG_DATA[currentLang].distributionLabel4 || 'Ecosystem'
            ];

            const distributionCtx = document.getElementById('distributionChart').getContext('2d');
            distributionChartInstance = new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Token Allocation',
                        data: [15, 40, 20, 25], // Community, Liquidity, Team, Ecosystem
                        backgroundColor: [
                            'rgba(79, 70, 229, 0.8)',  // Indigo
                            'rgba(59, 130, 246, 0.8)', // Blue
                            'rgba(245, 158, 11, 0.8)', // Amber
                            'rgba(107, 114, 128, 0.8)' // Gray
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                color: chartColors.textColor,
                                font: { family: "'Kanit', sans-serif" }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: context => `${context.label}: ${context.raw}%`
                            }
                        }
                    }
                }
            });
        }

        function calculateBurnData(initial = false) {
            const initialSupply = 1000000000;
            const years = 10;
            let supply = initialSupply;

            const year0Label = LANG_DATA[currentLang].burnYear0 || 'Year 0';
            const yearLabel = LANG_DATA[currentLang].burnYear || 'Year';

            if (initial) {
                return { labels: [year0Label], data: [initialSupply] };
            }

            const labels = [year0Label];
            const data = [initialSupply];

            for (let i = 1; i <= years; i++) {
                supply *= 0.90; // 10% burn
                labels.push(`${yearLabel} ${i}`);
                data.push(supply);
            }
            return { labels, data };
        }

        function createBurnChart(data) {
            if (burnChart) {
                burnChart.destroy();
            }

            const labelKey = LANG_DATA[currentLang].burnLabel || 'Remaining Supply';
            const tooltipText = LANG_DATA[currentLang].burnTooltipText || 'Supply';

            const burnChartCtx = document.getElementById('burnChart').getContext('2d');
            burnChart = new Chart(burnChartCtx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: labelKey,
                        data: data.data,
                        backgroundColor: 'rgba(220, 38, 38, 0.7)',
                        borderColor: 'rgba(220, 38, 38, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: value => (value / 1e6).toLocaleString(currentLang) + 'M',
                                color: chartColors.textColor
                            },
                            grid: { color: chartColors.gridColor }
                        },
                        x: {
                            ticks: {
                                color: chartColors.textColor,
                                font: { family: "'Kanit', sans-serif" }
                            },
                            grid: { color: chartColors.gridColor }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: context => `${tooltipText}: ${context.raw.toLocaleString(currentLang, {maximumFractionDigits: 0})} FM`
                            }
                        }
                    }
                }
            });
        }

        // --- EVENT LISTENER SETUP ---

        function initializeEventListeners() {
            // Mobile Menu Toggle
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            // Smooth Scrolling for Nav Links
            document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });

            // Language Dropdown
            const dropdownBtn = document.getElementById('lang-dropdown-btn');
            const dropdownMenu = document.getElementById('lang-dropdown-menu');
            dropdownBtn.addEventListener('click', () => {
                dropdownMenu.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });

            // Language Switcher
            document.querySelectorAll('.lang-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const lang = btn.getAttribute('data-lang');
                    setLanguage(lang);
                    dropdownMenu.classList.add('hidden');
                });
            });

            // --- Section 3: Income Engine Logic ---
            const nftSelector = document.getElementById('nft-selector');
            const nftCostEl = document.getElementById('nft-cost');
            const nftReturnEl = document.getElementById('nft-return');
            
            nftSelector.addEventListener('click', (e) => {
                // Ensure the clicked element is a button with the correct class
                if (e.target.classList.contains('nft-button')) {
                    const level = e.target.dataset.level;
                    if (nftData[level]) {
                        // Update text
                        nftCostEl.innerText = `${nftData[level].cost.toLocaleString()} USDT`;
                        nftReturnEl.innerText = `${nftData[level].return.toLocaleString()} USDT`;
                        
                        // Update button styles
                        const nftButtons = document.querySelectorAll('.nft-button');
                        nftButtons.forEach(btn => {
                            btn.classList.remove('bg-indigo-600', 'text-white');
                            btn.classList.add('bg-gray-200', 'text-gray-800');
                        });
                        e.target.classList.add('bg-indigo-600', 'text-white');
                        e.target.classList.remove('bg-gray-200', 'text-gray-800');
                    }
                }
            });

            // Burn Simulation Button
            document.getElementById('simulateBurnBtn').addEventListener('click', () => {
                const burnData = calculateBurnData(false); // false = run full simulation
                createBurnChart(burnData);
            });
        }

        // --- INITIALIZATION ---

        function initializeApp() {
            // Set default src for all img flags in the dropdown
            document.querySelectorAll('.lang-option img').forEach(img => {
                const lang = img.parentNode.getAttribute('data-lang');
                if (LANG_FLAG_URLS[lang]) {
                    img.src = LANG_FLAG_URLS[lang];
                }
            });

            // Add fallback text for chart labels to LANG_DATA if not present
            const fallbackLabels = {
                th: { distributionLabel1: 'ชุมชน / Airdrop', distributionLabel2: 'สภาพคล่องเริ่มต้น', distributionLabel3: 'ทีมงาน / พัฒนา', distributionLabel4: 'ระบบนิเวศ', burnYear0: 'ปีที่ 0', burnYear: 'ปีที่', burnLabel: 'อุปทานคงเหลือ', burnTooltipText: 'อุปทาน' },
                en: { distributionLabel1: 'Community / Airdrop', distributionLabel2: 'Initial Liquidity', distributionLabel3: 'Team / Development', distributionLabel4: 'Ecosystem', burnYear0: 'Year 0', burnYear: 'Year', burnLabel: 'Remaining Supply', burnTooltipText: 'Supply' },
                zh: { distributionLabel1: '社区 / 空投', distributionLabel2: '初始流动性', distributionLabel3: '团队 / 开发', distributionLabel4: '生态系统', burnYear0: '第 0 年', burnYear: '第', burnLabel: '剩余供应', burnTooltipText: '供应' }
            };

            for (const lang in fallbackLabels) {
                if (LANG_DATA[lang]) {
                    for (const key in fallbackLabels[lang]) {
                        if (!LANG_DATA[lang][key]) {
                            LANG_DATA[lang][key] = fallbackLabels[lang][key];
                        }
                    }
                }
            }

            initializeEventListeners();
            setLanguage(currentLang); // Load default language and render everything
        }

        initializeApp();

    });
})();
