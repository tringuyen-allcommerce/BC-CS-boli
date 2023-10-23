import $ from 'jquery';
import modalFactory from '../theme/global/modal';

export default function () {
    $('[data-emthemesmodez-fullscreen-modal]').each((i, el) => {
        const modals = modalFactory('.modal--fullscreen');
        const delay = $(el).data('emthemesmodezFullscreenModalDelay') || 5000;

        if (modals.length > 0) {
            modals[0].updateContent(el, { wrap: true });
            modals[0].$modal
                    .on('open.fndtn.reveal', () => {
                        $('body').addClass('has-activeModal--fullscreen');
                        modals[0].$modal.find('.animatecss').addClass('animated');
                    })
                    .on('close.fndtn.reveal', () => {
                        $('body').removeClass('has-activeModal--fullscreen');
                        modals[0].$modal.find('.animatecss').removeClass('animated');
                    });

            setTimeout(() => {
                modals[0].open({ pending: false, clearContent: false });
            }, delay);
        }
    });
}
