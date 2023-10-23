import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
// import '../../vendor/lightbox2/css/lightbox.css';
import lightbox from '../../vendor/lightbox2/js/lightbox.min.js';
// import '../../vendor/stickyfill/stickyfill.css';
import '../../vendor/stickyfill/stickyfill.min.js';
import modalContent from './modal-content';
import fullscreenBanner from './fullscreen-banner';
import themeCustom from './theme-custom.js';
import ajaxAddToCart from './ajax-addtocart.js';

window.themeJQuery = $; // Bolioptics
window.stencilUtils = utils; // Bolioptics

export default function (context) {
    ajaxAddToCart(context);

    function request($placeholder, tmpl, urlKey = 'emthemesmodezProductsByCategory') {
        if ($placeholder.data('emthemesmodezLoaded')) return;

        let template = tmpl;
        if ($placeholder.data('emthemesmodezTemplate')) { template = $placeholder.data('emthemesmodezTemplate'); }

        let url = $placeholder.data(urlKey);
        url = url.replace(/https?:\/\/[^/]+/, ''); // WORKAROUND: fix stencil localhost use real absolute urls

        utils.api.getPage(url, { template }, (err, resp) => {
            $placeholder.html(resp);
            $placeholder.data('emthemesmodezLoaded', true);

            // init products carousel
            $('[data-slick]', $placeholder)

                .on('init', e => setTimeout(() => {
                    // init nested carousel
                    $('[data-slick-nested]', e.target).each((i, el) => {
                        $(el).slick($(el).data('slickNested'));
                    });
                }, 200))

                .on('breakpoint', e => setTimeout(() => {
                    $('[data-slick-nested]', e.target).slick('setPosition');
                }, 200))

                .slick();
        });
    }


    // ========================================================================
    // Ajax load products in a category
    // ========================================================================
    function initAjaxProductsByCategory() {
        $('[data-emthemesmodez-products-by-category]').each((i, placeholder) => {
            request($(placeholder), 'emthemes-modez/category/ajax-products-by-category-result', 'emthemesmodezProductsByCategory');
        });
    }
    initAjaxProductsByCategory();


    // ------------------------------------------------------------------------
    // Show products isotype by brand tabs
    // ------------------------------------------------------------------------

    if (typeof context.emthemesModez_enableProductBrandsTabs !== 'undefined' && context.emthemesModez_enableProductBrandsTabs) {
        $('.emthemesModez-productBrandsTabs').each((i, tabs) => {
            const $tabs = $(tabs);
            const brands = [];
            const $liArr = $tabs.next('.productGrid').children('[data-product-brand]');

            function show(brand) {
                $liArr.each((j, li) => {
                    const $li = $(li);
                    const liBrand = $li.data('productBrand');

                    if (liBrand !== '' && liBrand !== brand) { $li.addClass('hide'); } else { $li.removeClass('hide'); }
                });
            }

            $liArr.each((j, li) => {
                const s = $(li).data('productBrand');
                if (s !== '' && brands.indexOf(s) < 0) { brands.push(s); }
            });

            const $ul = $(document.createElement('ul'));
            $tabs.append($ul);

            brands.forEach((brand) => {
                $ul.append(`<li><a href="#">${brand}</a></li>`);

                $('li:last-child a', $ul).on('click', { brand }, (event) => {
                    $('a', $ul).removeClass('active');
                    $(event.target).addClass('active');
                    show(event.data.brand);
                    return false;
                });
            });

            $('li:first a', $ul).click();
        }); // each
    } // if


    // ------------------------------------------------------------------------
    // Instagram Carousel
    // ------------------------------------------------------------------------

    const $carousel = $('[data-emthemesmodez-instafeed-carousel]');

    if ($carousel.length) {
        $carousel.on('instafeedAfter', (e) => {
            const $el = $(e.target);
            $el.slick($el.data('emthemesmodezInstafeedCarousel'));
        });
    }

    // ------------------------------------------------------------------------
    // Video Block
    // Toggle video when click on the preview image
    // ------------------------------------------------------------------------

    const $videoToggle = $('[data-emthemesmodez-video-toggle]');

    if ($videoToggle.length > 0) {
        $videoToggle.on('click', (e) => {
            e.preventDefault();

            const $a = $(e.currentTarget);
            const $video = $(`#${$a.data('emthemesmodezVideoToggle')}`);

            if (!$video.attr('src').match(/autoplay/)) {
                $video.attr('src', `${$video.attr('src')}?autoplay=1`);
            }

            $a.addClass('is-open');
            $video.addClass('is-open');
        });
    }

    // ------------------------------------------------------------------------
    // Show color swatches on product card
    // ------------------------------------------------------------------------

    $('[data-emthemesmodez-card-colors]').each((i, el) => {
        const $el = $(el);
        $el.html('');
        $(el).data('emthemesmodezCardColors').split(',').forEach((s) => {
            $el.append(`<span class="emthemesModez-card-color-swatch" style="background-color:${s}"></span>`);
        });
    });

    // ========================================================================
    // Configura lightbox for element data-lightbox showing screenshots on product detail page
    // ========================================================================
    lightbox.option({
        fitImagesInViewport: false,
    });


    // ========================================================================
    // Sticky content
    // - On product detail page fluid lightbox layout
    // ========================================================================

    /* eslint-disable func-names */
    $.fn.Stickyfill = function () {
        this.each(function () {
            window.Stickyfill.add(this);
        });

        return this;
    };
    /* eslint-enable func-names */

    $('.sticky').Stickyfill(); // eslint-disable-line


    // ------------------------------------------------------------------------
    // Update Parallax when the main carousel is resized
    // ------------------------------------------------------------------------

    $('.heroCarousel').on('setPosition', () => {
        $(window).trigger('resize.px.parallax');
    });

    // ------------------------------------------------------------------------
    // Ajax load static page from element [data-emthemesmodez-modal-content]
    // ------------------------------------------------------------------------
    modalContent();

    // ------------------------------------------------------------------------
    // Init the popup fullscreen banner
    // ------------------------------------------------------------------------
    fullscreenBanner();

    // ------------------------------------------------------------------------
    // Theme Custom
    // ------------------------------------------------------------------------
    themeCustom();
}
