import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../theme/common/product-details';
import swal from '../theme/global/sweet-alert';
import currencyFormat from './currency-format';

//
// https://javascript.info/task/delay-promise
//
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//
// https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
//
function promiseSerial(funcs) {
    return funcs.reduce(
        (promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([])
    );
}

class BundleProducts {
    constructor($scope, context) {
        this.$scope = $scope;

        this.qtyOnChange();

        return new ProductDetails($scope, context);
    }

    qtyOnChange() {
        const $scope = this.$scope;

        $('[data-bundle-products-price-qty]', $scope).on('change', (event) => {
            const $el = $(event.currentTarget);
            const $submit = $el.parents('form').find('[type="submit"]');
            const value = parseInt($el.val(), 10);

            if (value > 0) {
                $submit.addClass('positiveQty');
            } else {
                $submit.removeClass('positiveQty');
            }
        });
    }
}

class AddBundleProducts {
    constructor() {
        this.$progressPopup = $('.bundleProducts-progressModal').eq(0);
        this.$progressPopupCurrent = $('.bundleProducts-progressModal-current', this.$progressPopup);
        this.$progressPopupActions = $('.bundleProducts-progressModal-actions', this.$progressPopup);
        this.$progressPopupClose = $('[data-close]', this.$progressPopup);

        this.calcTotal();
        this.bind();
    }

    bind() {
        this.$progressPopupClose.click(event => {
            event.preventDefault();
            this.hideProgressPopup();
        });

        $('[data-bundle-products-add-all]').on('click', () => {
            this.addAllProducts();
        });

        $('body').on('change', '[data-bundle-products-price-qty]', () => {
            this.calcTotal();
        });
    }

    calcTotal() {
        let total = 0;

        $('[data-bundle-products-price-qty]').not(':disabled').each((idx, elm) => {
            const $elm = $(elm);
            const qty = parseInt($elm.val(), 10);

            if (qty > 0) {
                const price = parseFloat($elm.data('bundleProductsPriceQty'));
                total += price * qty;
            }
        });

        const $total = $('[data-bundle-products-total]');

        $total.html(currencyFormat(total, $total.data('bundleProductsTotal')));
    }

    addAllProducts() {
        const promises = [];
        this.progressCurrent = 0;
        let invalidForm = false;

        $('[data-bundle-products-price-qty]').not(':disabled').each((id, el) => {
            const $input = $(el);
            const qty = parseInt($input.val(), 10);

            if (qty > 0) {
                const form = $input.parents('form').get(0);

                if (!form.checkValidity()) {
                    $('#form-action-addToCart', form).click();
                    invalidForm = true;
                    return false;
                }

                promises.push(async () => {
                    this.progressCurrent++;
                    this.updateProgressPopup();

                    await this.addProduct(form); // eslint-disable-line no-unused-expressions

                    // wait 1s before adding to cart a new item in order to avoid request failed.
                    await delay(1000); // eslint-disable-line no-unused-expressions
                });
            }
        });

        if (promises.length && !invalidForm) {
            this.progressTotal = promises.length;
            this.showProgressPopup();

            promiseSerial(promises).then(() => {
                this.showProgressPopupActions();
                this.updateCartCounter();
            });

            return;
        }

        if (!invalidForm) {
            return swal({
                text: 'There are no products to add to cart!',
                type: 'error',
            });
        }
    }

    async addProduct(form) {
        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        const promise = new Promise((resolve) => {
            utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(new FormData(form)), (err, response) => {
                const errorMessage = err || response.data.error;
                // Guard statement
                if (errorMessage) {
                    // Strip the HTML from the error message
                    const tmp = document.createElement('DIV');
                    tmp.innerHTML = errorMessage;

                    alert(tmp.textContent || tmp.innerText);
                } else {
                    const $addToCartBtn = $('#form-action-addToCart', form);
                    const addedMessage = $addToCartBtn.data('addedMessage');

                    if (addedMessage) {
                        $addToCartBtn.val(addedMessage).addClass('addedToCart');
                    }
                }

                resolve();
            });
        });

        await promise; // eslint-disable-line no-unused-expressions
    }

    filterEmptyFilesFromForm(formData) {
        try {
            for (const [key, val] of formData) {
                if (val instanceof File && !val.name && !val.size) {
                    formData.delete(key);
                }
            }
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
        }
        return formData;
    }

    showProgressPopup() {
        this.$progressPopupActions.addClass('u-hiddenVisually');
        this.$progressPopup.addClass('is-open');
    }

    hideProgressPopup() {
        this.$progressPopupCurrent.css('width', 0);
        this.$progressPopupActions.addClass('u-hiddenVisually');
        this.$progressPopup.removeClass('is-open');
    }

    updateProgressPopup() {
        if (this.progressTotal > 0) {
            this.$progressPopupCurrent.css('width', `${this.progressCurrent / this.progressTotal * 100}%`);
        } else {
            this.$progressPopupCurrent.css('width', 0);
        }
    }

    showProgressPopupActions() {
        this.$progressPopupActions.removeClass('u-hiddenVisually');
    }

    updateCartCounter() {
        utils.api.cart.getContent({ template: 'cart/preview' }, (err, resp) => {
            if (err) {
                return;
            }

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', resp);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cart-quantity') || 0;

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);
        });
    }
}

export default function (context) {
    const $bundles = $('[data-papathemes-bundle-product-full]');

    $bundles.each((id, placeholder) => {
        const $placeholder = $(placeholder);
        const productId = $placeholder.data('papathemes-bundle-product-full');
        let template = $placeholder.data('papathemes-template');

        if (!template) {
            template = 'products/quick-view';
        }

        utils.api.product.getById(productId, { template }, (err, response) => {
            $placeholder.after(response);

            const $scope = $placeholder.next();

            $placeholder.remove();

            return new BundleProducts($scope, context);
        });
    });

    $('[data-papathemes-bundle-product]').each((id, placeholder) => {
        const $placeholder = $(placeholder);

        utils.api.product.getById($placeholder.data('papathemes-bundle-product'), { template: $placeholder.data('papathemes-template') }, (err, response) => {
            $placeholder.after(response);
            $placeholder.remove();
        });
    });

    $('[data-papathemes-bundle-category]').each((id, placeholder) => {
        const $placeholder = $(placeholder);

        const options = {
            template: $placeholder.data('papathemes-template'),
            config: {
                category: {
                    products: {
                        limit: 100,
                    },
                },
            },
        };

        utils.api.getPage($placeholder.data('papathemes-bundle-category'), options, (err, response) => {
            $placeholder.after(response);
            $placeholder.remove();
        });
    });

    $('body').on('click', '[data-bundle-quantity-change] button', (event) => {
        event.preventDefault();
        const $target = $(event.currentTarget);
        const $input = $target.parents('[data-bundle-quantity-change]').find('input');
        const quantityMin = parseInt($input.data('quantityMin'), 10);
        const quantityMax = parseInt($input.data('quantityMax'), 10);

        let qty = parseInt($input.val(), 10);

        // If action is incrementing
        if ($target.data('action') === 'inc') {
            // If quantity max option is set
            if (quantityMax > 0) {
                // Check quantity does not exceed max
                if ((qty + 1) <= quantityMax) {
                    qty++;
                }
            } else {
                qty++;
            }
        } else if (qty > 1) {
            // If quantity min option is set
            if (quantityMin > 0) {
                // Check quantity does not fall below min
                if ((qty - 1) >= quantityMin) {
                    qty--;
                }
            } else {
                qty--;
            }
        }

        $input.val(qty).change();
    });

    if ($bundles.length) {
        return new AddBundleProducts();
    }
}
