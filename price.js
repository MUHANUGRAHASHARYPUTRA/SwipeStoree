
// ======================================================
//                  PRICES.JS - Price Classes
// ======================================================

class ProductPrice {
    constructor(basePrice) {
        this.basePrice = basePrice; // Base price in Rupiah
    }

    // Price multipliers for different capacities
    getCapacityMultiplier(capacity) {
        const multipliers = {
            '128 GB': 1.0,    // 11.499.000
            '256 GB': 1.1739130434782608695652173913,  // 13.499.000 (11.499.000 * 1.1739130434782608695652173913 = 13.499.000)
            '512 GB': 1.5,    // 17.248.500 (11.499.000 * 1.5 = 17.248.500)
            '1 TB': 2.0,      // 22.998.000 (11.499.000 * 2.0 = 22.998.000)
            '2 TB': 2.5
        };
        return multipliers[capacity] || 1.0;
    }

    // Price multipliers for iPad Air 13 custom (only 128GB and 256GB)
    getCapacityMultiplierForIPadAir13(capacity) {
        const multipliers = {
            '128 GB': 1.0,    // 11.499.000
            '256 GB': 1.17392816766675367468   // 13.499.000
        };
        return multipliers[capacity] || 1.0;
    }

    // Price multipliers for different RAM sizes
    getRamMultiplier(ram) {
        const multipliers = {
            '8 GB': 1.0,
            '16 GB': 1.3,
            '32 GB': 1.6
        };
        return multipliers[ram] || 1.0;
    }

    // Calculate final price based on capacity and RAM
    calculatePriceWithRam(capacity, ram) {
        const capacityMultiplier = this.getCapacityMultiplier(capacity);
        const ramMultiplier = this.getRamMultiplier(ram);
        return Math.round(this.basePrice * capacityMultiplier * ramMultiplier);
    }

    // Get price breakdown with RAM
    getPriceBreakdownWithRam(capacity, ram) {
        const finalPrice = this.calculatePriceWithRam(capacity, ram);
        const capacityMultiplier = this.getCapacityMultiplier(capacity);
        const ramMultiplier = this.getRamMultiplier(ram);
        return {
            basePrice: this.basePrice,
            capacity: capacity,
            ram: ram,
            capacityMultiplier: capacityMultiplier,
            ramMultiplier: ramMultiplier,
            finalPrice: finalPrice
        };
    }

    // Calculate final price based on capacity
    calculatePrice(capacity) {
        return Math.round(this.basePrice * this.getCapacityMultiplier(capacity));
    }

    // Calculate final price for iPad Air 13 custom (only capacity)
    calculatePriceForIPadAir13(capacity) {
        return Math.round(this.basePrice * this.getCapacityMultiplierForIPadAir13(capacity));
    }

    // Get price breakdown
    getPriceBreakdown(capacity) {
        const finalPrice = this.calculatePrice(capacity);
        const multiplier = this.getCapacityMultiplier(capacity);
        return {
            basePrice: this.basePrice,
            capacity: capacity,
            multiplier: multiplier,
            finalPrice: finalPrice
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductPrice;



}