import PageManager from '../page-manager';
import $ from 'jquery';

function encodeHTML(s) {
    return $('<div></div>').text(s).text();
}

export default class Compare extends PageManager {

    loaded() {
        const message = this.context.compareRemoveMessage;

        // Papathemes - BoliOptics customization
        // ------------------------------------------------

        // Convert custom fields array to mapped object:
        // data = { 
        //    Warranty: { 0: "5/1 Years", 1: "5/1 Years" }, 
        //    Certificate: { 0: "ISO9001", 1: "ISO9001" } ,
        // }
        let data = {};
        this.context.comparisons.forEach(({ custom_fields = [] }, i) => {
            custom_fields.forEach(({ name, value }) => {
                if (name !== 'card_label' && name !== 'card_label' && name.indexOf('__') !== 0) {
                    data[name] = { ...data[name], [i]: value };
                }
            });
        });
        // console.log(data);

        // Convert the mapped object to sorted array:
        // data = [
        //    { name: "Certificate", values: ["ISO9001", "ISO9001"] },
        //    { name: "Warranty", values: ["5/1 Years", "5/1 Years"] },
        // ]
        data = Object.getOwnPropertyNames(data).sort().map(name => ({
            name,
            values: Object.getOwnPropertyNames(data[name]).reduce((arr, i) => {
                arr[i] = data[name][i];
                return arr;
            }, new Array(this.context.comparisons.length)),
        }));
        // console.log(data);

        const html = data.map(({ name, values }) => `
            <tr class="compareTable-row">
                <th class="compareTable-heading">
                    <span class="compareTable-headingText">${encodeHTML(name)}</span>
                </th>
                ${values.map(value => `
                    <td class="compareTable-item">${encodeHTML(value)}</td>
                `)}
            </tr>
        `);

        $('.compareTable-row--cf').after(html);

        // ------------------------------------------------




        $('body').on('click', '[data-comparison-remove]', (event) => {
            if (this.context.comparisons.length <= 2) {
                alert(message);
                event.preventDefault();
            }
        });
    }
}
