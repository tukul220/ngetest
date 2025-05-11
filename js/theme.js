import { storage } from './storage.js';

export const theme = (() => {

    const THEME_RED = '#FF0000'; // Gaya tema merah
    const THEME_LIGHT = 'light';

    const themeColors = {
        '#000000': '#FFFFFF',
        '#FFFFFF': '#000000',
        '#212529': '#F8F9FA',
        '#F8F9FA': '#212529',
        '#FF0000': '#FFFFFF' // mapping merah ke putih
    };

    let theme = null;
    let isAuto = false;
    let observerLight = null;
    let observerRed = null;

    const toLight = (element) => {
        element.classList.replace('text-light', 'text-dark');
        element.classList.replace('btn-theme-red', 'btn-theme-light');
        element.classList.replace('bg-red', 'bg-light');
        element.classList.replace('bg-black', 'bg-white');
        element.classList.replace('bg-theme-red', 'bg-theme-light');
        element.classList.replace('color-theme-red', 'color-theme-white');
        element.classList.replace('btn-outline-light', 'btn-outline-dark');
        element.classList.replace('bg-cover-black', 'bg-cover-white');
    };

    const toRed = (element) => {
        element.classList.replace('text-dark', 'text-light');
        element.classList.replace('btn-theme-light', 'btn-theme-red');
        element.classList.replace('bg-light', 'bg-red');
        element.classList.replace('bg-white', 'bg-black');
        element.classList.replace('bg-theme-light', 'bg-theme-red');
        element.classList.replace('color-theme-white', 'color-theme-red');
        element.classList.replace('btn-outline-dark', 'btn-outline-light');
        element.classList.replace('bg-cover-white', 'bg-cover-black');
    };

    const onLight = () => {
        theme.set('active', THEME_LIGHT);
        document.documentElement.setAttribute('data-bs-theme', THEME_LIGHT);

        const now = document.querySelector('meta[name="theme-color"]').getAttribute('content');
        const elements = document.querySelectorAll('.text-light, .btn-theme-red, .bg-red, .bg-black, .bg-theme-red, .color-theme-red, .btn-outline-light, .bg-cover-black');

        let countChange = 0;
        elements.forEach((el) => {
            const callback = (e) => {
                if (el.isEqualNode(e.target) && (e.propertyName === 'background-color' || e.propertyName === 'color')) {
                    countChange += 1;
                    if (elements.length === countChange) {
                        document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColors[now] || now);
                    }
                }
            };

            el.removeEventListener('transitionend', callback);
            el.addEventListener('transitionend', callback);
        });

        elements.forEach((el) => {
            observerLight.observe(el);
        });
    };

    const onRed = () => {
        theme.set('active', THEME_RED);
        document.documentElement.setAttribute('data-bs-theme', THEME_RED);

        const now = document.querySelector('meta[name="theme-color"]').getAttribute('content');
        const elements = document.querySelectorAll('.text-dark, .btn-theme-light, .bg-light, .bg-white, .bg-theme-light, .color-theme-white, .btn-outline-dark, .bg-cover-white');

        let countChange = 0;
        elements.forEach((el) => {
            const callback = (e) => {
                if (el.isEqualNode(e.target) && (e.propertyName === 'background-color' || e.propertyName === 'color')) {
                    countChange += 1;
                    if (elements.length === countChange) {
                        document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColors[now] || now);
                    }
                }
            };

            el.removeEventListener('transitionend', callback);
            el.addEventListener('transitionend', callback);
        });

        elements.forEach((el) => {
            observerRed.observe(el);
        });
    };

    const isRedMode = (onRed = null, onLight = null) => {
        const status = theme.get('active') === THEME_RED;
        return (onRed && onLight) ? (status ? onRed : onLight) : status;
    };

    const change = () => {
        isRedMode() ? onLight() : onRed();
    };

    const showButtonChangeTheme = () => {
        if (!isAuto) return;
        document.getElementById('button-theme').style.display = 'block';
    };

    const spyTop = () => {
        const observerTop = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const themeColor = ['bg-black', 'bg-white'].some(c => entry.target.classList.contains(c))
                        ? isRedMode('#FF0000', '#FFFFFF')
                        : isRedMode('#212529', '#F8F9FA');

                    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
                }
            });
        }, {
            rootMargin: '0% 0% -95% 0%',
        });

        document.querySelectorAll('section').forEach((el) => {
            observerTop.observe(el);
        });
    };

    const init = () => {
        theme = storage('theme');

        observerLight = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting || !entry.isIntersecting) {
                    toLight(entry.target);
                }
            });
            obs.disconnect();
        });

        observerRed = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting || !entry.isIntersecting) {
                    toRed(entry.target);
                }
            });
            obs.disconnect();
        });

        if (!theme.has('active')) {
            theme.set('active', THEME_LIGHT);
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                theme.set('active', THEME_RED);
            }
        }

        switch (document.body.getAttribute('data-theme')) {
            case 'red':
                theme.set('active', THEME_RED);
                break;
            case 'light':
                theme.set('active', THEME_LIGHT);
                break;
            default:
                isAuto = true;
                break;
        }

        isRedMode() ? onRed() : onLight();

        const toggle = document.getElementById('darkMode');
        if (toggle) {
            toggle.checked = isRedMode();
            if (!isAuto) {
                toggle.parentElement.remove();
            }
        }
    };

    return {
        change,
        init,
        spyTop,
        isRedMode,
        showButtonChangeTheme
    };
})();
