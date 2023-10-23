// js file by Ryan McCoy - fewtr.com
// for jam project
$(document).ready(() => {
    let ctrlDown = false;


    const ctrlKey = 17;


    const cmdKey = 91;


    const vKey = 86;


    const cKey = 67;

    $(document).keydown((e) => {
        if (e.keyCode === ctrlKey || e.keyCode === cmdKey) ctrlDown = true;
    }).keyup((e) => {
        if (e.keyCode === ctrlKey || e.keyCode === cmdKey) ctrlDown = false;
    });

    $('.jam').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('.jam').bind('contextmenu', () => false);

    $('img').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('img').bind('contextmenu', () => false);

    $('#baguetteBox-overlay').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('#baguetteBox-overlay').bind('contextmenu', () => false);

    $('#baguetteBox-slider').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('#baguetteBox-slider').bind('contextmenu', () => false);


    $('img').attr('draggable', 'false');
    $('img.lb-image').addClass('nopoint');
}); // ends doc ready


$(document).ajaxComplete(() => {
    let ctrlDown = false;
    const ctrlKey = 17;
    const cmdKey = 91;
    const vKey = 86;
    const cKey = 67;

    $(document).keydown((e) => {
        if (e.keyCode === ctrlKey || e.keyCode === cmdKey) ctrlDown = true;
    }).keyup((e) => {
        if (e.keyCode === ctrlKey || e.keyCode === cmdKey) ctrlDown = false;
    });

    $('.jam').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('.jam').bind('contextmenu', () => false);

    $('img').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('img').bind('contextmenu', () => false);

    $('#baguetteBox-overlay').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('#baguetteBox-overlay').bind('contextmenu', () => false);

    $('#baguetteBox-slider').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('#baguetteBox-slider').bind('contextmenu', () => false);

    $('img').attr('draggable', 'false');
    $('img.lb-image').addClass('nopoint');
}); // ends doc ready

if ($('body').hasClass('activeModal')) {
    $('#baguetteBox-overlay').addClass('test');
} else {
    //
}


$(document).on('click', '.productView-images.jam', () => {
    const ctrlDown = false;
    const vKey = 86;
    const cKey = 67;
    $('#baguetteBox-overlay').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('#baguetteBox-overlay').bind('contextmenu', () => false);
    $('img').attr('draggable', 'false');
    $('img').addClass('nopoint');
});

$(document).on('click', '.productView-images.jam', () => {
    const ctrlDown = false;
    const vKey = 86;
    const cKey = 67;
    $('.lb-container img').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('.lb-container img').bind('contextmenu', () => false);
    $('.lb-container lb-nav a').keydown((e) => {
        if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)) return false;
    });

    $('.lb-container lb-nav a').bind('contextmenu', () => false);
    $('img').attr('draggable', 'false');
    $('img').addClass('nopoint');
});

$('img').attr('draggable', 'false');
$('img.lb-image').addClass('nopoint');


// #baguetteBox-overlay img

// has-activeModal

// baguetteBox-slider

// lb-container


//  add following to a desired tag
//  class="jam"
//  oncopy="return false" oncut="return false" onpaste="return false"
