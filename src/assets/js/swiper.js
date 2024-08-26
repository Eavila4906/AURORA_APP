function swiperCategoria() {
    const swiperEl = document.querySelector('.swiper-categoria');
    // swiper parameters
    const swiperParams = {
        slidesPerView: 6,
        breakpoints: {
            640: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 6,
            },
            360: {
                slidesPerView: 1,
            },
        },
        on: {
            init() {
                // ...
            },
        },
    };

    // now we need to assign all parameters to Swiper element
    Object.assign(swiperEl, swiperParams);

    // and now initialize it
    swiperEl.initialize();
}