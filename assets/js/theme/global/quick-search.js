import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import StencilDropDown from './stencil-dropdown';

export default function () {
    const TOP_STYLING = 'top: 49px;';
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchDiv = $('#quickSearch');
    const $searchQuery = $('#search_query');
    const stencilDropDownExtendables = {
        hide: () => {
            $searchQuery.blur();
            $('[data-search-quick]').val('').trigger('change'); // PapaThemes clear search results
        },
        show: (event) => {
            $searchQuery.focus();
            if (event) {
                event.stopPropagation();
            }
        },
    };
    const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);
    stencilDropDown.bind($('[data-search="quickSearch"]'), $quickSearchDiv, TOP_STYLING);

    stencilDropDownExtendables.onBodyClick = (e, $container) => {
        // If the target element has this data tag or one of it's parents, do not close the search results
        // We have to specify `.modal-background` because of limitations around Foundation Reveal not allowing
        // any modification to the background element.
        // PapaThemes - BoliOptics MOD
        if (stencilDropDown.modalOpened && $(e.target).closest('[data-prevent-quick-search-close], .modal-background, [data-quick-search-form]').length === 0) {
            stencilDropDown.hide($container);
        }
    };

    // stagger searching for 200ms after last input
    const doSearch = _.debounce((searchQuery) => {
        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            if (err) {
                return false;
            }

            $quickSearchResults.html(response);
            stencilDropDown.show($quickSearchDiv, null, TOP_STYLING);
        });
    }, 200);

    utils.hooks.on('search-quick', (event) => {
        const searchQuery = $(event.currentTarget).val();

        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            return;
        }

        doSearch(searchQuery);
    });

    // Catch the submission of the quick-search
    $quickSearchDiv.on('submit', (event) => {
        const searchQuery = $(event.currentTarget).find('input').val();

        if (searchQuery.length === 0) {
            return event.preventDefault();
        }

        return true;
    });

    // Papathemes: visible quick search MOD
    $quickSearchDiv.on('click', '[data-quick-search-link]', (event) => {
        event.preventDefault();
        $('[data-search="quickSearch"] form').each((i, form) => {
            const $form = $(form);
            const searchQuery = $form.find('input').val();
            if (searchQuery.length > 0) {
                $form.submit();
                return false;
            }
        });
    });
}
