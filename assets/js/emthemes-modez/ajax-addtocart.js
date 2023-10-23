import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import modalFactory from '../theme/global/modal';
import swal from '../theme/global/sweet-alert';

function applyModalAutoClose(modal) {
    const $autoCloseEl = modal.$modal.find('[data-auto-close]');
    if ($autoCloseEl.length > 0) {
        let sec = $autoCloseEl.data('autoClose') || 5;
        const $count = $autoCloseEl.find('.count');
        $count.html(sec);

        modal.autoCloseTimer = window.setInterval(() => { // eslint-disable-line
            if (sec > 1) {
                sec--;
                $count.html(sec);
            } else {
                modal.autoCloseTimer = null; // eslint-disable-line
                modal.close();
                modal.close();
            }
        }, 1000);
    }
}

/**
 * Get URL Parameter
 *
 * @param  {String} Parameter name
 * @param  {String} URL
 * @return {String} return string value or 0 if not exist
 */
function getURLParam(name, url) {
    const results = new RegExp(`[\?&]${name}=([^&#]*)`).exec(url);
    return results[1] || 0;
}

/**
 * Get cart contents
 *
 * @param {String} cartItemHash
 * @param {Function} onComplete
 */
function getCartContent(cartItemHash, onComplete) {
    const options = {
        template: 'cart/preview',
        params: {
            suggest: cartItemHash,
        },
        config: {
            cart: {
                suggestions: {
                    limit: 4,
                },
            },
        },
    };

    utils.api.cart.getContent(options, onComplete);
}

/**
 * Update cart content
 *
 * @param {String} cartItemHash
 */
function updateCartContent(modal, cartItemHash) {
    getCartContent(cartItemHash, (err, response) => {
        if (err) {
            return;
        }

        modal.updateContent(response);
        applyModalAutoClose(modal); // Supermarket

        // Update cart counter
        const $body = $('body');
        const $cartQuantity = $('[data-cart-quantity]', modal.$content);
        const $cartCounter = $('.navUser-action .cart-count');
        const quantity = $cartQuantity.data('cart-quantity') || 0;

        $cartCounter.addClass('cart-count--positive');
        $body.trigger('cart-quantity-update', quantity);
    });
}

/**
 * Checks if the current window is being run inside an iframe
 * @returns {boolean}
 */
function isRunningInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

/**
 * Redirect to url
 *
 * @param {String} url
 */
function redirectTo(url) {
    if (isRunningInIframe() && !window.iframeSdk) {
        window.top.location = url;
    } else {
        window.location = url;
    }
}

export default function (context) {
    const modal = modalFactory('#previewModal')[0];

    modal.$modal.addClass('preview-modal');

    $('body').on('click', '[data-emthemesmodez-cart-item-add]', (event) => {
        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        event.preventDefault();

        const productId = getURLParam('product_id', event.target.href);
        if (productId === 0) {
            return;
        }

        const formData = new FormData();
        formData.append('product_id', productId);

        const $form = $(event.target).closest('form');
        const qty = $form.find(`input[name=qty_${productId}]`).val();
        if (qty && qty.length > 0) {
            if (parseInt(qty, 10) > 0) {
                formData.append('qty[]', qty);
            } else if ($(event.target).is('[data-check-qty]')) {
                swal({
                    text: context.ajaxAddToCartEnterQty || 'Please enter quantity',
                    type: 'error',
                });
                return;
            }
        }

        // Add item to cart
        utils.api.cart.itemAdd(formData, (err, response) => {
            const errorMessage = err || response.data.error;

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;

                alert(tmp.textContent || tmp.innerText);

                return;
            }

            // Papathemes - Supermarket: Support redirect to cart page after added to cart
            if (context.themeSettings.redirect_cart) {
                redirectTo(response.data.cart_item.cart_url || context.urls.cart);
                return;
            }

            // Supermarket - OBPS Mod
            // Open preview modal and update content
            modal.open();
            modal.open({ size: 'large' });

            $('body').trigger('ajax-addtocart-item-added', productId);

            updateCartContent(modal, response.data.cart_item.hash);
        });
    });
}
