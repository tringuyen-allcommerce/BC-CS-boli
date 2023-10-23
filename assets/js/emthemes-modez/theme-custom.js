import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';

export default function () {
    // Sidebar collapse on mobile/tablet
    const sidebarTitle = '.sidebarBlock-heading-icon';
    const quickSearchResult = '.quickSearchResults';
    const quickSearchResultWrap = '.dropdown--quickSearch';
    const quickSearchInput = '.emthemesModez-header-userSection #search_query';
    $('body')
        .on('click', sidebarTitle, (event) => {
            event.preventDefault();
            const $this = $(event.currentTarget);
            const navList = $this.parents('.sidebarBlock').find('.navList');
            $this.toggleClass('opened');
            navList.toggleClass('opened');
        })
        .on('click', quickSearchInput, () => {
            const searchString = $(quickSearchInput).val();
            if (searchString) {
                $(quickSearchResultWrap).addClass('is-search-typing').css({ top: '49px', left: '0', 'z-index': '99' });
            } else {
                $(quickSearchResultWrap).removeClass('is-search-typing').attr('css', '');
            }
        })
        .on('click', `${quickSearchResultWrap} .modal-close`, () => {
            $(quickSearchResultWrap).removeClass('is-search-typing').attr('css', '');
        });

    // Products filter on top
    const filterBtn = '#facetedSearch .facetedSearch-toggle';
    const sortBy = '.actionBar-section';
    if ($(filterBtn).hasClass('is-open')) {
        $(filterBtn).parents('#facetedSearch').removeClass('closed');
        $(sortBy).removeClass('closed');
    } else {
        $(filterBtn).parents('#facetedSearch').addClass('closed');
        $(sortBy).addClass('closed');
    }
    $(document).delegate(filterBtn, 'click', (event) => {
        if ($(event.currentTarget).hasClass('is-open')) {
            $(event.currentTarget).parents('#facetedSearch').removeClass('closed');
            $(sortBy).removeClass('closed');
        } else {
            $(event.currentTarget).parents('#facetedSearch').addClass('closed');
            $(sortBy).addClass('closed');
        }
    });

    // Disabled drag image
    $(window).on('dragstart', () => false);

    // Sticky Header
    const $stickyMenus = $('[data-stickymenu]');
    if ($stickyMenus.length > 0) {
        $stickyMenus.each((i, el) => {
            $(el).data('papathemesOriginalTop', $(el).offset().top)
                .after('<div class="papathemes-stickymenu-placeholder"></div>');
        });

        $(window)
            .on('scroll', _.debounce(() => {
                $stickyMenus.each((i, el) => {
                    if ($(window).scrollTop() > $(el).data('papathemesOriginalTop')) {
                        $(el).addClass('is-sticky')
                            .next().height($(el).outerHeight());
                        $(quickSearchResultWrap).addClass('search-is-sticky');
                    } else {
                        $(el).removeClass('is-sticky');
                        $(quickSearchResultWrap).removeClass('search-is-sticky');
                    }
                });
            }, 10))

            .on('resize', _.debounce(() => {
                $stickyMenus.each((i, el) => {
                    $(el).removeClass('is-sticky');
                    $(quickSearchResultWrap).removeClass('search-is-sticky');

                    $(el).data('papathemesOriginalTop', $(el).offset().top)
                        .next().height($(el).outerHeight());
                });
            }, 100));
    }

    // Remote Product by ID
    $('[data-remote-product]').get()
        .map(el => $(el))
        .filter($el => !$el.data('loaded'))
        .map($el => {
            $el.data('loaded', true);
            utils.api.product.getById($el.data('productId'), { template: 'papathemes/product/card' }, (err, resp) => {
                $el.html($(resp).html());
            });
        });
}
