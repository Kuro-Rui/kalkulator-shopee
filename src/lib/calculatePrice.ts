import {
    CategoryData,
    SellerType,
    SHOPEE_MALL_BASE_FEE,
    PROMO_XTRA_FEE,
    PROMO_XTRA_MAX,
    SHOPEE_LIVE_FEE,
    SHOPEE_LIVE_MAX,
    PO_FEE,
    SHIPPING_INSURANCE_FEE,
    HEMAT_BIAYA_KIRIM_FEE,
    ORDER_PROCESSING_FEE,
    shopeeeLiveExcludedCategories,
} from "@/data/shopeeCategories";

export interface CalculationInput {
    sellerType: SellerType;
    category: CategoryData;
    isPreOrder30Days: boolean;
    isFreeShippingXtra: boolean;
    isPromoXtra: boolean;
    isShopeLiveXtra: boolean;
    isShippingInsurance: boolean;
    isHematBiayaKirim: boolean;
    desiredNetPrice: number;
}

export interface FeeBreakdown {
    name: string;
    percentage: number;
    amount: number;
    maxAmount?: number;
    isApplied: boolean;
}

export interface CalculationResult {
    initialPrice: number;
    netPrice: number;
    totalFeePercentage: number;
    totalFeeAmount: number;
    breakdown: FeeBreakdown[];
}

// Rumus: Harga Awal = Harga Bersih / (1 - Total Fee %)
// Dengan fee yang ada maksimum, kita perlu iterasi untuk menemukan harga yang tepat

export function calculateInitialPrice(input: CalculationInput): CalculationResult {
    const {
        sellerType,
        category,
        isPreOrder30Days,
        isFreeShippingXtra,
        isPromoXtra,
        isShopeLiveXtra,
        isShippingInsurance,
        isHematBiayaKirim,
        desiredNetPrice,
    } = input;

    // Fixed fees (biaya tetap dalam Rupiah)
    let fixedFees = ORDER_PROCESSING_FEE; // Biaya Proses Pesanan selalu dikenakan

    if (isHematBiayaKirim) {
        fixedFees += HEMAT_BIAYA_KIRIM_FEE;
    }

    // Inisialisasi breakdown
    const breakdown: FeeBreakdown[] = [];

    // 1. Biaya Administrasi (berdasarkan tipe penjual dan kategori)
    const adminFee = category.adminFee;

    // Untuk Mall, biaya admin sama dengan Non-Star/Star/Star+
    breakdown.push({
        name: "Biaya Administrasi",
        percentage: adminFee,
        amount: 0,
        isApplied: true,
    });

    // 2. Biaya Pembayaran (khusus Mall)
    if (sellerType === "mall") {
        breakdown.push({
            name: "Biaya Pembayaran (Mall)",
            percentage: SHOPEE_MALL_BASE_FEE,
            amount: 0,
            isApplied: true,
        });
    }

    // 3. Biaya PO > 30 hari
    if (isPreOrder30Days) {
        breakdown.push({
            name: "Produk Pre-Order",
            percentage: PO_FEE,
            amount: 0,
            isApplied: true,
        });
    }

    // 4. Biaya Gratis Ongkir XTRA
    if (isFreeShippingXtra && category.freeShippingFee && category.freeShippingFee > 0) {
        breakdown.push({
            name: "Gratis Ongkir XTRA",
            percentage: category.freeShippingFee,
            amount: 0,
            maxAmount: category.freeShippingMaxFee,
            isApplied: true,
        });
    }

    // 5. Biaya Promo XTRA
    if (isPromoXtra) {
        breakdown.push({
            name: "Promo XTRA",
            percentage: PROMO_XTRA_FEE,
            amount: 0,
            maxAmount: PROMO_XTRA_MAX,
            isApplied: true,
        });
    }

    // 6. Biaya Shopee Live XTRA
    const isExcludedFromLive = shopeeeLiveExcludedCategories.some((cat) =>
        category.name.includes(cat),
    );
    if (isShopeLiveXtra && !isExcludedFromLive) {
        breakdown.push({
            name: "Shopee Live XTRA",
            percentage: SHOPEE_LIVE_FEE,
            amount: 0,
            maxAmount: SHOPEE_LIVE_MAX,
            isApplied: true,
        });
    }

    // 7. Biaya Asuransi Pengiriman
    if (isShippingInsurance) {
        breakdown.push({
            name: "Premi",
            percentage: SHIPPING_INSURANCE_FEE,
            amount: 0,
            isApplied: true,
        });
    }

    // 8. Biaya Hemat Biaya Kirim (flat fee)
    if (isHematBiayaKirim) {
        breakdown.push({
            name: "Hemat Biaya Kirim",
            percentage: 0,
            amount: HEMAT_BIAYA_KIRIM_FEE,
            isApplied: true,
        });
    }

    // 9. Biaya Proses Pesanan (flat fee, selalu dikenakan)
    breakdown.push({
        name: "Biaya Proses Pesanan",
        percentage: 0,
        amount: ORDER_PROCESSING_FEE,
        isApplied: true,
    });

    // Helper function untuk menghitung fee berdasarkan harga
    const calculateFeeAmount = (fee: FeeBreakdown, price: number): number => {
        if (fee.percentage === 0) {
            return fee.amount; // Flat fee
        }

        let feeAmount: number;
        if (fee.name === "Premi") {
            feeAmount = Math.ceil((fee.percentage / 100) * price);
        } else {
            feeAmount = Math.round((fee.percentage / 100) * price);
        }

        if (fee.maxAmount && feeAmount > fee.maxAmount) {
            feeAmount = fee.maxAmount;
        }

        return feeAmount;
    };

    // Harga minimum yang diperbolehkan Shopee
    const MIN_PRICE = 99;

    // Binary search untuk menemukan harga awal yang tepat
    // Untuk net price kecil/negatif, harga awal tetap harus >= MIN_PRICE
    let low = MIN_PRICE;
    let high = Math.max(MIN_PRICE, desiredNetPrice * 3, 10000); // Upper bound yang cukup besar
    let bestInitialPrice = low;
    let bestNetPrice = 0;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        // Hitung total fee untuk harga ini
        let totalFee = 0;
        for (const fee of breakdown) {
            if (fee.isApplied) {
                totalFee += calculateFeeAmount(fee, mid);
            }
        }

        const netPrice = mid - totalFee;

        if (netPrice === desiredNetPrice) {
            bestInitialPrice = mid;
            bestNetPrice = netPrice;
            break;
        } else if (netPrice < desiredNetPrice) {
            low = mid + 1;
        } else {
            // netPrice > desiredNetPrice, simpan sebagai kandidat dan cari yang lebih kecil
            bestInitialPrice = mid;
            bestNetPrice = netPrice;
            high = mid - 1;
        }
    }

    // Cari harga awal terkecil yang menghasilkan net price >= desiredNetPrice
    // Lalu sesuaikan agar net price = desiredNetPrice tepat jika memungkinkan
    let finalInitialPrice = Math.max(bestInitialPrice, MIN_PRICE);

    // Coba turunkan harga untuk mendapatkan net price yang tepat
    while (finalInitialPrice > MIN_PRICE) {
        let totalFee = 0;
        for (const fee of breakdown) {
            if (fee.isApplied) {
                totalFee += calculateFeeAmount(fee, finalInitialPrice - 1);
            }
        }
        const netPrice = finalInitialPrice - 1 - totalFee;

        if (netPrice >= desiredNetPrice) {
            finalInitialPrice--;
            bestNetPrice = netPrice;
        } else {
            break;
        }
    }

    // Hitung ulang fee dengan harga final
    let finalTotalFee = 0;
    for (const fee of breakdown) {
        if (!fee.isApplied) continue;

        const feeAmount = calculateFeeAmount(fee, finalInitialPrice);
        fee.amount = feeAmount;
        finalTotalFee += feeAmount;
    }

    const actualNetPrice = finalInitialPrice - finalTotalFee;
    const effectiveFeePercentage = (finalTotalFee / finalInitialPrice) * 100;

    return {
        initialPrice: finalInitialPrice,
        netPrice: actualNetPrice,
        totalFeePercentage: effectiveFeePercentage,
        totalFeeAmount: finalTotalFee,
        breakdown: breakdown.filter((fee) => fee.isApplied),
    };
}

export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
