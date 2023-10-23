import sweetAlert from 'sweetalert2';

// Set defaults for sweetalert2 popup boxes
sweetAlert.setDefaults({
    buttonsStyling: false,
    confirmButtonClass: 'button button-confirm',
    cancelButtonClass: 'button button-cancel',
});

// Re-export
export default sweetAlert;
