import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import { defaultModal } from '../theme/global/modal';

export default function () {
    const modal = defaultModal();
    const contentCache = {};

    $('body').on('click', '[data-emthemesmodez-modal-content]', (event) => {
        event.preventDefault();

        const $target = $(event.target);
        const url = $target.prop('href');

        modal.open({ size: 'large' });

        if (url in contentCache) {
            modal.updateContent(contentCache[url]);
        } else {
            const template = 'emthemes-modez/products/field-guide-ajax-page-content';

            utils.api.getPage(url, { template }, (err, resp) => {
                modal.updateContent(resp);
                contentCache[url] = resp;
            });
        }
    });
}
