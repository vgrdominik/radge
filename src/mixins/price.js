export default {
    methods: {
        totalWithIva(price, iva) {
            return parseFloat(price.toString().replace(',', '.')) + parseFloat(price.toString().replace(',', '.')) * (iva / 100)
        },
        totalPriceWithIva(price, iva) {
            return this.price(this.totalWithIva(price, iva))
        },
        price(price) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)
        }
    }
}
