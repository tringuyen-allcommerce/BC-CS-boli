// ============================================================================
// PAPATHEMES SARAHMARKET CUSTOMIZATION:
// - Using slick carousel for image thumbnails.
// - Using baguetteBox for image lightbox.
// ============================================================================

import $ from 'jquery';
import 'jquery-zoom';
import _ from 'lodash';
import 'slick-carousel';
import baguetteBox from 'baguettebox.js';
import imagesLoaded from 'imagesloaded';
import swal from '../global/sweet-alert';

imagesLoaded.makeJQueryPlugin($);

export default class ImageGallery {
    constructor($gallery) {
        this.openVideo = this.openVideo.bind(this);

        this.$mainCarousel = $gallery.find('[data-image-gallery-main]');
        this.$navCarousel = $gallery.find('[data-image-gallery-nav]');

        const $defSlide = this.$mainCarousel.find('.slick-current');
        const defSlideIdx = $defSlide.parent().children().index($defSlide);

        this.defaultSlideIndex = defSlideIdx;

        const uid = _.uniqueId();

        if (this.$mainCarousel.attr('id') === '') {
            this.$mainCarousel.attr('id', `imageGalleryMainCarousel${uid}`);
        }

        if (this.$navCarousel.attr('id') === '') {
            this.$navCarousel.attr('id', `imageGalleryNavCarousel${uid}`);
        }
    }

    init() {
        this.bindEvents();
    }

    setMainImage(imgObj) {
        this.currentImage = _.clone(imgObj);

        this.swapMainImage();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = _.clone(this.currentImage);
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    setActiveThumb() {
        const i = this.$mainCarousel.slick('slickCurrentSlide');
        this.$navCarousel
            .find('.slick-slide')
            .removeClass('slick-current')
            .eq(i)
            .addClass('slick-current');
    }

    swapMainImage() {
        try {
            this.$mainCarousel.slick('slickGoTo', this.defaultSlideIndex);
        } catch (e) {
            // ignore
        }
        this.$mainCarousel.find(`.slick-slide:eq(${this.defaultSlideIndex}) img`).attr('src', this.currentImage.mainImageUrl);
        this.$mainCarousel.find(`.slick-slide:eq(${this.defaultSlideIndex}) a`).attr('href', this.currentImage.zoomImageUrl);
        this.$navCarousel.find(`.productView-imageCarousel-nav-item:eq(${this.defaultSlideIndex}) img`).attr('src', this.currentImage.mainImageUrl);
        baguetteBox.run(`#${this.$mainCarousel.attr('id')}`);
    }

    bindEvents() {
        this.$mainCarousel
            .slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: false,
                initialSlide: this.defaultSlideIndex,
                asNavFor: `#${this.$navCarousel.attr('id')}`,
                arrows: false,
            })
            .on('afterChange', () => {
                this.setActiveThumb();
            });

        this.$navCarousel
            .imagesLoaded(() => {
                // BoliOptics
                this.$navCarousel.on('init', (event) => {
                    const $slick = $(event.target);
                    const i = $slick.find('.slick-slide').index($slick.find('.slick-current'));
                    if (i < 3) {
                        $slick.addClass('_fixed');
                    } else {
                        $slick.removeClass('_fixed');
                    }
                });
                this.$navCarousel.on('beforeChange', (event, slick, currentSlide, nextSlide) => {
                    const $slick = $(event.target);
                    if (nextSlide < 3) {
                        $slick.addClass('_fixed');
                    } else {
                        $slick.removeClass('_fixed');
                    }
                });
                // this.$navCarousel.on('setPosition', (event, slick, a, b) => {
                //     const $slick = $(event.target);
                //     const i = $slick.find('.slick-slide').not('._video').index($slick.find('.slick-current'));
                //     if (i <= 0) {
                //         $slick.find('.slick-track').css('transform', 'none');
                //     }
                // });
                if (this.$navCarousel.data('imageGalleryNavHorizontal')) {
                    this.$navCarousel.slick({
                        slidesToShow: 5,
                        slidesToScroll: 1,
                        infinite: false,
                        initialSlide: this.defaultSlideIndex,
                        asNavFor: `#${this.$mainCarousel.attr('id')}`,
                        arrows: true,
                        focusOnSelect: true,
                        centerPadding: 0,
                        adaptiveHeight: true,
                        centerMode: true,
                        responsive: [{
                            breakpoint: 550,
                            settings: {
                                arrows: false,
                            },
                        }],
                    });
                } else {
                    this.$navCarousel.slick({
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        infinite: false,
                        // initialSlide: this.defaultSlideIndex, // occur bug when set!!!
                        asNavFor: `#${this.$mainCarousel.attr('id')}`,
                        arrows: true,
                        vertical: true,
                        verticalSwiping: true,
                        focusOnSelect: true,
                        centerPadding: 0,
                        adaptiveHeight: true,
                        centerMode: true,
                        responsive: [
                            {
                                breakpoint: 550,
                                settings: {
                                    vertical: false,
                                    verticalSwiping: false,
                                    slidesToShow: 4,
                                    arrows: false,
                                },
                            },
                        ],
                    });
                }
            });

        baguetteBox.run(`#${this.$mainCarousel.attr('id')}`);

        this.$mainCarousel.find('a[data-video-id]').on('click', this.openVideo);
        this.$navCarousel.find('a[data-video-id]').on('click', this.openVideo);
    }

    openVideo(event) {
        event.preventDefault();
        const videoId = $(event.target).data('videoId');
        swal({
            html: `
                <iframe
                    id="player"
                    type="text/html"
                    width="640"
                    height="390"
                    frameborder="0"
                    webkitAllowFullScreen
                    mozallowfullscreen
                    allowFullScreen
                    src="//www.youtube.com/embed/${videoId}"
                    data-video-player>
                </iframe>`,
            showConfirmButton: false,
            showCloseButton: true,
            width: 700,
            customClass: 'swal2-modal--video',
        });
    }
}
