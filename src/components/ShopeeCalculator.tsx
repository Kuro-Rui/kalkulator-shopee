import { useState, useMemo } from "react";
import { SellerType, CategoryData, categoryGroups } from "@/data/shopeeCategories";
import { calculateInitialPrice } from "@/lib/calculatePrice";
import { SellerTypeSelector } from "./SellerTypeSelector";
import { CategorySelector } from "./CategorySelector";
import { ProgramToggle } from "./ProgramToggle";
import { PriceInput } from "./PriceInput";
import { ResultCard } from "./ResultCard";
import { Package, Truck, Percent, Video, Shield, Wallet } from "lucide-react";

export function ShopeeCalculator() {
    const [sellerType, setSellerType] = useState<SellerType>("non_star");
    const [category, setCategory] = useState<CategoryData | null>(null);
    const [isPreOrder30Days, setIsPreOrder30Days] = useState(false);
    const [isFreeShippingXtra, setIsFreeShippingXtra] = useState(false);
    const [isPromoXtra, setIsPromoXtra] = useState(false);
    const [isShopeLiveXtra, setIsShopeLiveXtra] = useState(false);
    const [isShippingInsurance, setIsShippingInsurance] = useState(false);
    const [isHematBiayaKirim, setIsHematBiayaKirim] = useState(false);
    const [desiredNetPrice, setDesiredNetPrice] = useState<number>(0);

    const result = useMemo(() => {
        if (!category || desiredNetPrice <= 0) return null;

        return calculateInitialPrice({
            sellerType,
            category,
            isPreOrder30Days,
            isFreeShippingXtra,
            isPromoXtra,
            isShopeLiveXtra,
            isShippingInsurance,
            isHematBiayaKirim,
            desiredNetPrice,
        });
    }, [
        sellerType,
        category,
        isPreOrder30Days,
        isFreeShippingXtra,
        isPromoXtra,
        isShopeLiveXtra,
        isShippingInsurance,
        isHematBiayaKirim,
        desiredNetPrice,
    ]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="gradient-shopee py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-foreground/20 rounded-full text-sm text-primary-foreground mb-4">
                        <Package className="w-4 h-4" />
                        Kalkulator Harga Shopee
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2">
                        Hitung Harga Awal Produk
                    </h1>
                    <p className="text-primary-foreground/80 text-sm md:text-base max-w-lg mx-auto">
                        Tentukan harga jual sebelum terkena potongan admin Shopee agar mendapat
                        harga bersih sesuai keinginan
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {/* Input Section */}
                <section className="bg-card rounded-2xl border-2 border-border p-6 shadow-card space-y-6">
                    <SellerTypeSelector value={sellerType} onChange={setSellerType} />

                    <div className="border-t border-border pt-6">
                        <CategorySelector value={category} onChange={setCategory} />
                    </div>

                    {category && (
                        <div className="border-t border-border pt-6 space-y-3">
                            <label className="block text-sm font-semibold text-foreground">
                                Program & Kondisi
                            </label>
                            <div className="space-y-3">
                                <ProgramToggle
                                    icon={Package}
                                    title="Pre-Order > 30 Hari"
                                    description="Produk PO yang sudah diupload lebih dari 30 hari"
                                    badge="+3%"
                                    checked={isPreOrder30Days}
                                    onChange={setIsPreOrder30Days}
                                />
                                <ProgramToggle
                                    icon={Shield}
                                    title="Asuransi Pengiriman"
                                    description="Produk terdaftar dalam program asuransi pengiriman"
                                    badge="+0.5%"
                                    checked={isShippingInsurance}
                                    onChange={setIsShippingInsurance}
                                />
                                <ProgramToggle
                                    icon={Truck}
                                    title="Gratis Ongkir XTRA"
                                    description="Tergabung dalam program & sudah menyelesaikan min. 500 pesanan"
                                    badge={
                                        category?.freeShippingFee
                                            ? `+${category.freeShippingFee}%`
                                            : undefined
                                    }
                                    checked={isFreeShippingXtra}
                                    onChange={setIsFreeShippingXtra}
                                    disabled={!category?.freeShippingFee}
                                />
                                <ProgramToggle
                                    icon={Percent}
                                    title="Promo XTRA"
                                    description="Tergabung dalam program Promo XTRA untuk subsidi voucher diskon"
                                    badge="+4.5% (maks. 60rb)"
                                    checked={isPromoXtra}
                                    onChange={setIsPromoXtra}
                                />
                                <ProgramToggle
                                    icon={Video}
                                    title="Shopee Live XTRA"
                                    description="Penjualan melalui sesi streaming Shopee Live"
                                    badge="+3% (maks. 20rb)"
                                    checked={isShopeLiveXtra}
                                    onChange={setIsShopeLiveXtra}
                                />
                                <ProgramToggle
                                    icon={Wallet}
                                    title="Hemat Biaya Kirim"
                                    description="Penjual tergabung dalam program Hemat Biaya Kirim"
                                    badge="+Rp350"
                                    checked={isHematBiayaKirim}
                                    onChange={setIsHematBiayaKirim}
                                />
                            </div>
                        </div>
                    )}

                    {category && (
                        <div className="border-t border-border pt-6">
                            <PriceInput
                                value={desiredNetPrice}
                                onChange={setDesiredNetPrice}
                                label="Harga Bersih yang Diinginkan"
                                placeholder="0"
                            />
                        </div>
                    )}
                </section>

                {/* Result Section */}
                <section>
                    <ResultCard
                        result={result}
                        desiredNetPrice={desiredNetPrice}
                        hasCategory={!!category}
                    />
                </section>

                {/* Footer */}
                <footer className="text-center text-xs text-muted-foreground py-6">
                    <p>
                        Data biaya admin berdasarkan{" "}
                        <a
                            href="https://seller.shopee.co.id/edu/article/15965"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Pusat Edukasi Penjual Shopee
                        </a>
                    </p>
                    <p className="mt-1">Terakhir diperbarui: November 2025</p>
                </footer>
            </main>
        </div>
    );
}
