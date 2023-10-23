/*
 Import all product specific js
 */
import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.reveal';
import ImageGallery from '../product/image-gallery';
import modalFactory from '../global/modal';
import _ from 'lodash';
import Wishlist from '../wishlist';

// We want to ensure that the events are bound to a single instance of the product details component
let productSingleton = null;

utils.hooks.on('cart-item-add', (event, form) => {
    if (productSingleton) {
        productSingleton.addProductToCart(event, form);
    }
});

utils.hooks.on('product-option-change', (event, changedOption) => {
    if (productSingleton) {
        productSingleton.productOptionsChanged(event, changedOption);
    }
});

export default class Product {
    constructor($scope, context, productAttributesData = {}) {
        this.$overlay = $('[data-cart-item-add] .loadingOverlay');
        this.$scope = $scope;
        this.context = context;
        this.imageGallery = new ImageGallery($('[data-image-gallery]', this.$scope));
        this.imageGallery.init();
        this.listenQuantityChange();
        this.initRadioAttributes();
        this.initCustomTabs(); // Papathemes - Supermarket
        this.wishlist = new Wishlist().load();
        this.isBuyNow = false; // papathemes-bolioptics

        const $form = $('form[data-cart-item-add]', $scope);
        const $productOptionsElement = $('[data-product-option-change]', $form);
        const hasOptions = $productOptionsElement.html().trim().length;

        // Update product attributes. If we're in quick view and the product has options, then also update the initial view in case items are oos
        if (_.isEmpty(productAttributesData) && hasOptions) {
            const $productId = $('[name="product_id"]', $form).val();

            utils.api.productAttributes.optionChange($productId, $form.serialize(), (err, response) => {
                const attributesData = response.data || {};

                this.updateProductAttributes(attributesData);
                this.updateView(attributesData);
            });
        } else {
            this.updateProductAttributes(productAttributesData);
        }

        $productOptionsElement.show();

        // papathemes-bolioptics {{{
        const model = this.getViewModel(this.$scope);
        model.$addToCart.on('click', () => {
            this.isBuyNow = false;
        });
        model.$buyNow.on('click', () => {
            this.isBuyNow = true;
            $form.submit();
        });
        this.$scope.find('.button--shippingCalc').on('click', () => this.$scope.find('.PASE-shipping-estimator').toggleClass('show'));

        let $summary = this.$scope.find('[data-product-summary]');
        let $desc = this.$scope.find('[data-product-description]');

        if (window.frameElement || this.context.inDevelopment) {
            if ($summary.length === 0) {
                $summary = $(`
                    <ul>
                        <li style="color:red">add <code>data-product-summary=""</code> attribute to a DIV element to display summary content here.</li>
                        <li>Sit sollicitudin. Laoreet facilisis netus ultrices nostra Morbi, dolor malesuada ullamcorper senectus eu curae; luctus nostra quis luctus nibh, amet primis. Inceptos orci ornare vel cursus urna cursus aenean hac fringilla.</li>
                        <li>Fringilla cubilia tincidunt consectetuer elementum. Eleifend laoreet duis fames, aptent bibendum aliquet ipsum cras. Felis, dapibus. Phasellus accumsan. Pellentesque Vestibulum hac morbi semper congue porta neque ridiculus. Mauris ornare semper accumsan Ac habitasse dis enim. Et sollicitudin ligula torquent nostra Habitasse odio.</li>
                        <li>Condimentum lectus pulvinar justo curabitur dolor mi. At mi ullamcorper Dis porttitor et nisi curae; euismod amet parturient ac ultricies facilisi iaculis parturient facilisis semper. Laoreet dictumst.</li>
                    </ul>
                `);
            }
            if ($desc.length === 0) {
                $desc = $(`
                    <div>
                        <p style="color:red">Add <code>data-product-description=""</code> attribute to a DIV element in Product Description editor to display here</p>
                        <p>Leo quis ad interdum pede vestibulum Sed ultrices iaculis. Ut proin ut senectus ante in semper libero adipiscing neque dolor, amet primis. Euismod mi consequat tortor mauris purus montes diam torquent condimentum odio congue tempus Et Tortor. Habitant, quis, ad venenatis mollis tortor taciti erat. Urna ad enim condimentum. Elementum, hymenaeos quisque neque ac sed, dis fames quam eu lacus lorem, neque dignissim mattis enim nec mi egestas urna. Lacus nec lorem justo pharetra potenti.</p>
                        <p>Neque sociosqu hymenaeos cras in lorem. Non malesuada mauris orci nullam tellus auctor dis vestibulum enim dis faucibus dolor leo aptent dui maecenas interdum sociosqu quisque nisl, tincidunt condimentum aenean adipiscing vulputate vulputate a diam nulla pulvinar sociis. Phasellus facilisis per arcu habitasse dapibus rhoncus curabitur. Donec nostra pellentesque nisi. Hymenaeos bibendum suspendisse amet scelerisque morbi praesent interdum tortor. Lectus eleifend. Luctus nunc hymenaeos pellentesque lectus diam ac sed praesent congue condimentum lorem ullamcorper vehicula nulla auctor congue nibh. Commodo cubilia nam suscipit tristique nisi dignissim sodales nam litora quis consequat eu vestibulum sed hendrerit luctus mollis inceptos in, orci duis adipiscing Luctus lorem ipsum auctor. Ullamcorper sociis. Condimentum dignissim. Per litora iaculis lacinia erat curae;. Molestie adipiscing egestas leo feugiat. Posuere curae; lobortis felis.</p>
                    </div>
                `);
            }
        }
        this.$scope.find('.productView-summary').first().append($summary);
        this.$scope.find('.productView-fullDesc').first().append($desc);
        // }}}

        this.previewModal = modalFactory('#previewModal')[0];
        productSingleton = this;
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param $scope
     */
    getViewModel($scope) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scope),
            $rrpWithTax: $('[data-product-rrp-with-tax]', $scope),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scope),
            $rrpWithoutTax: $('[data-product-rrp-without-tax]', $scope),
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $buyNow: $('#form-action-buyNow', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            $sku: $('[data-product-sku]'),
            quantity: {
                $text: $('.incrementTotal', $scope),
                $input: $('[name=qty\\[\\]]', $scope),
            },
        };
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     *
     * Handle product options changes
     *
     */
    productOptionsChanged(event, changedOption) {
        const $changedOption = $(changedOption);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        // Paralbag - show selected swatch label
        const $attrEl = $changedOption.closest('[data-product-attribute]');
        if ($attrEl.data('product-attribute') === 'swatch') {
            $attrEl.find('[data-option-value]').html($changedOption.next().find('.form-option-variant').attr('title'));
        }

        utils.api.productAttributes.optionChange(productId, $form.serialize(), (err, response) => {
            const productAttributesData = response.data || {};

            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData);
        });
    }

    showProductImage(image) {
        if (_.isPlainObject(image)) {
            const zoomImageUrl = utils.tools.image.getSrc(
                image.data,
                this.context.themeSettings.zoom_size
            );

            const mainImageUrl = utils.tools.image.getSrc(
                image.data,
                this.context.themeSettings.product_size
            );

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
            });
        } else {
            this.imageGallery.restoreImage();
        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    listenQuantityChange() {
        this.$scope.on('click', '[data-quantity-change] button', (event) => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const viewModel = this.getViewModel(this.$scope);
            const $input = viewModel.quantity.$input;
            const quantityMin = parseInt($input.data('quantity-min'), 10);
            const quantityMax = parseInt($input.data('quantity-max'), 10);

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

            // update hidden input
            viewModel.quantity.$input.val(qty).change();
            // update text
            viewModel.quantity.$text.text(qty);
        });
    }

    /**
     *
     * Add a product to cart
     *
     */
    addProductToCart(event, form) {
        const $addToCartBtn = $('#form-action-addToCart', $(event.target));
        const $buyNowBtn = $('#form-action-buyNow', $(event.target));
        const originalBtnVal = $addToCartBtn.val();
        const originalBuyNowBtnVal = $buyNowBtn.val();
        const waitMessage = $addToCartBtn.data('waitMessage');

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        // Prevent default
        event.preventDefault();

        // Bundle products
        const $quantity = $('[name="qty[]"]', form);
        if ($quantity.length) {
            if ($quantity.val() < 1) {
                $quantity.val(1).change();
            }
        }

        $addToCartBtn
            .val(waitMessage)
            .prop('disabled', true);

        $buyNowBtn
            .val(waitMessage)
            .prop('disabled', true);

        this.$overlay.show();

        // Add item to cart
        utils.api.cart.itemAdd(new FormData(form), (err, response) => {
            const errorMessage = err || response.data.error;

            $addToCartBtn
                .val(originalBtnVal)
                .prop('disabled', false);

            $buyNowBtn
                .val(originalBuyNowBtnVal)
                .prop('disabled', false);

            this.$overlay.hide();

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;

                alert(tmp.textContent || tmp.innerText);

                return;
            }

            // papathemes-bolioptics
            if (this.isBuyNow) {
                return this.redirectTo(this.context.urls.checkout.single_address);
            }

            // Open preview modal and update content
            if (this.previewModal) {
                this.previewModal.open();

                this.updateCartContent(this.previewModal, response.data.cart_item.hash);
            } else {
                this.$overlay.show();
                // if no modal, redirect to the cart page
                this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
            }
        });
    }

    /**
     * Get cart contents
     *
     * @param {String} cartItemHash
     * @param {Function} onComplete
     */
    getCartContent(cartItemHash, onComplete) {
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
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemHash
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemHash, onComplete) {
        this.getCartContent(cartItemHash, (err, response) => {
            if (err) {
                return;
            }

            modal.updateContent(response);

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', modal.$content);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cart-quantity') || 0;

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);

            if (onComplete) {
                onComplete(response);
            }
        });
    }

    /**
     * Show an message box if a message is passed
     * Hide the box if the message is empty
     * @param  {String} message
     */
    showMessageBox(message) {
        const $messageBox = $('.productAttributes-message');

        if (message) {
            $('.alertBox-message', $messageBox).text(message);
            $messageBox.show();
        } else {
            $messageBox.hide();
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updatePriceView(viewModel, price) {
        if (price.with_tax) {
            viewModel.$priceWithTax.html(price.with_tax.formatted);
        }

        if (price.without_tax) {
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
        }

        if (price.rrp_with_tax) {
            viewModel.$rrpWithTax.html(price.rrp_with_tax.formatted);
        }

        if (price.rrp_without_tax) {
            viewModel.$rrpWithoutTax.html(price.rrp_without_tax.formatted);
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updateView(data) {
        const viewModel = this.getViewModel(this.$scope);

        this.showMessageBox(data.stock_message || data.purchasing_message);

        if (_.isObject(data.price)) {
            this.updatePriceView(viewModel, data.price);
        }

        if (_.isObject(data.weight)) {
            viewModel.$weight.html(data.weight.formatted);
        }

        // Set variation_id if it exists for adding to wishlist
        if (data.variantId) {
            viewModel.$wishlistVariation.val(data.variantId);
        }

        // If SKU is available
        if (data.sku) {
            viewModel.$sku.text(data.sku);
        }

        // if stock view is on (CP settings)
        if (viewModel.stock.$container.length && _.isNumber(data.stock)) {
            // if the stock container is hidden, show
            viewModel.stock.$container.removeClass('u-hiddenVisually');

            viewModel.stock.$input.text(data.stock);
        }

        if (!data.purchasable || !data.instock) {
            viewModel.$addToCart.prop('disabled', true);
            viewModel.$increments.prop('disabled', true);
        } else {
            viewModel.$addToCart.prop('disabled', false);
            viewModel.$increments.prop('disabled', false);
        }
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = ` (${data.out_of_stock_message})`;

        this.showProductImage(data.image);

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', this.$scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('product-attribute-value'), 10);


            if (inStockIds.indexOf(attrId) !== -1) {
                this.enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                this.disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    disableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.hide();
        } else {
            $attribute.addClass('unavailable');
        }
    }

    disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        const $select = $attribute.parent();

        if (behavior === 'hide_option') {
            $attribute.toggleOption(false);
            // If the attribute is the selected option in a select dropdown, select the first option (MERC-639)
            if ($attribute.parent().val() === $attribute.attr('value')) {
                $select[0].selectedIndex = 0;
            }
        } else {
            $attribute.attr('disabled', 'disabled');
            $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
        }
    }

    enableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.show();
        } else {
            $attribute.removeClass('unavailable');
        }
    }

    enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            $attribute.toggleOption(true);
        } else {
            $attribute.removeAttr('disabled');
            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
        }
    }

    getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]');

        return $parent ? $parent.data('product-attribute') : null;
    }

    /**
     * Allow radio buttons to get deselected
     */
    initRadioAttributes() {
        $('[data-product-attribute] input[type="radio"]', this.$scope).each((i, radio) => {
            const $radio = $(radio);

            // Only bind to click once
            if ($radio.attr('data-state') !== undefined) {
                $radio.click(() => {
                    if ($radio.data('state') === true) {
                        $radio.prop('checked', false);
                        $radio.data('state', false);

                        $radio.change();
                    } else {
                        $radio.data('state', true);
                    }

                    this.initRadioAttributes();
                });
            }

            $radio.attr('data-state', $radio.prop('checked'));
        });
    }

    /**
     * Init custom tabs by parsing product description
     * (Added by Papathemes - Supermarket)
     */
    initCustomTabs() {
        const $customTabs = $('[data-custom-tab]', this.$scope);
        if ($customTabs.length === 0) {
            return;
        }

        const $tabs = $('.productView-description > .tabs', this.$scope);
        const $tabsContent = $('.productView-customTabs', this.$scope);

        if ($tabs.length === 0 || $tabsContent.length === 0) {
            return;
        }

        $customTabs.each((i, el) => {
            const $el = $(el);
            const $title = $el.find('[data-custom-tab-title]');
            const title = $title.html();

            let expand = $title.data('expand');

            if (!expand) {
                expand = 'View All';
            }

            let close = $title.data('close');

            if (!close) {
                close = 'Close';
            }

            $title.remove();

            const content = $el.html();

            $el.remove();

            const $tab = $(`<li class="tab tab--custom tab--custom-${i}"><a class="tab-title" href="#tab-custom-${i}">${title}</a></li>`);

            const $tabCustom = $('.tab--custom', $tabs);

            if ($tabCustom.length) {
                $tabCustom.last().after($tab);
            } else {
                $tabs.append($tab);
            }

            $tabsContent.append(`<div class="tab-content tab-content--custom-${i}" id="tab-custom-${i}"><h2 class="productView-section-heading">${title}</h2>${content}</div>`);

            // $(`.tab--custom-${i}`).click(() => {
            //     $('html, body').animate({ scrollTop: ($(`#tab-custom-${i}`).offset().top - 30) }, 500);
            // });
        });
    }
}
