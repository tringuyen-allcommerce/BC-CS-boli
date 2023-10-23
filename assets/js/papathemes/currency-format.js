function toFixedFix(n, prec) {
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    const k = Math.pow(10, prec);
    return Math.round(n * k) / k;
}

function numberFormat(number, decimals, decPoint, thousandsSep) {
    const n = !isFinite(+number) ? 0 : +number;
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
    const sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep;
    const dec = (typeof decPoint === 'undefined') ? '.' : decPoint;

    const s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

export default function currencyFormat(price, sample) {
    const token = sample.replace(/\d+[\,\.]*/g, '');
    const number = sample.replace(token, '');
    const decTest = /^((\d{1,3}\,)+\d{3}\.\d+|(\d{1,3}\,)+\d{3}|\d{1,3}\.\d+|\d+)$/;
    const decPoint = decTest.test(number) ? '.' : ',';
    const thousandsSep = decPoint === '.' ? ',' : '.';
    const decimals = decPoint === '.' ? number.replace(/^.*\./, '').length : number.replace(/^.*\,/, '').length;

    return sample.replace(/[\d\,\.]+/g, numberFormat(price, decimals, decPoint, thousandsSep));
}
