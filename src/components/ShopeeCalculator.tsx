import { useState, useMemo } from "react";
import { SellerType, CategoryData } from "@/data/shopeeCategories";
import { calculateInitialPrice, calculateNetPrice, formatRupiah } from "@/lib/calculatePrice";
import { SellerTypeSelector } from "./SellerTypeSelector";
import { CategorySelector } from "./CategorySelector";
import { ProgramToggle } from "./ProgramToggle";
import { PriceInput } from "./PriceInput";
import { ResultCard } from "./ResultCard";
import {
    Package,
    Truck,
    Percent,
    Video,
    Shield,
    Wallet,
    Copy,
    Check,
    Calculator,
} from "lucide-react";
import { toast } from "sonner";

export function ShopeeCalculator() {
    const [sellerType, setSellerType] = useState<SellerType>("non_star");
    const [category, setCategory] = useState<CategoryData | null>(null);
    const [isPreOrder30Days, setIsPreOrder30Days] = useState(false);
    const [isFreeShippingXtra, setIsFreeShippingXtra] = useState(false);
    const [isPromoXtra, setIsPromoXtra] = useState(false);
    const [isShopeLiveXtra, setIsShopeLiveXtra] = useState(false);
    const [isShippingInsurance, setIsShippingInsurance] = useState(false);
    const [isHematBiayaKirim, setIsHematBiayaKirim] = useState(false);
    const [isReverseCalculation, setIsReverseCalculation] = useState(false);
    const [inputPrice, setInputPrice] = useState<number | null>(null);
    const [copiedInput, setCopiedInput] = useState(false);

    const copyInputToClipboard = () => {
        if (result && !isReverseCalculation) {
            navigator.clipboard.writeText(result.netPrice.toString());
            setCopiedInput(true);
            toast.success("Harga berhasil disalin!");
            setTimeout(() => setCopiedInput(false), 2000);
        }
    };

    // Hitung minimal penghasilan yang mungkin (saat harga awal = 99)
    const minPossibleNetPrice = useMemo(() => {
        if (!category) return undefined;
        const minResult = calculateNetPrice({
            sellerType,
            category,
            isPreOrder30Days,
            isFreeShippingXtra,
            isPromoXtra,
            isShopeLiveXtra,
            isShippingInsurance,
            isHematBiayaKirim,
            desiredNetPrice: 0,
            initialPrice: 99,
        });
        return minResult.netPrice;
    }, [
        sellerType,
        category,
        isPreOrder30Days,
        isFreeShippingXtra,
        isPromoXtra,
        isShopeLiveXtra,
        isShippingInsurance,
        isHematBiayaKirim,
    ]);

    // Hitung maksimal penghasilan yang mungkin (saat harga awal = 150.000.000)
    const maxPossibleNetPrice = useMemo(() => {
        if (!category) return undefined;
        const maxResult = calculateNetPrice({
            sellerType,
            category,
            isPreOrder30Days,
            isFreeShippingXtra,
            isPromoXtra,
            isShopeLiveXtra,
            isShippingInsurance,
            isHematBiayaKirim,
            desiredNetPrice: 0,
            initialPrice: 150000000,
        });
        return maxResult.netPrice;
    }, [
        sellerType,
        category,
        isPreOrder30Days,
        isFreeShippingXtra,
        isPromoXtra,
        isShopeLiveXtra,
        isShippingInsurance,
        isHematBiayaKirim,
    ]);

    const result = useMemo(() => {
        // Abaikan marker untuk minus saja atau null
        const priceValue = inputPrice === -0.001 || inputPrice === null ? null : inputPrice;
        if (!category || priceValue === null) return null;
        // Untuk mode Hitung Harga Bersih, harus dalam range valid
        if (!isReverseCalculation && (priceValue < 99 || priceValue > 150000000)) return null;

        if (isReverseCalculation) {
            // Hitung harga awal dari harga bersih yang diinginkan
            return calculateInitialPrice({
                sellerType,
                category,
                isPreOrder30Days,
                isFreeShippingXtra,
                isPromoXtra,
                isShopeLiveXtra,
                isShippingInsurance,
                isHematBiayaKirim,
                desiredNetPrice: priceValue,
            });
        } else {
            // Hitung harga bersih dari harga awal
            return calculateNetPrice({
                sellerType,
                category,
                isPreOrder30Days,
                isFreeShippingXtra,
                isPromoXtra,
                isShopeLiveXtra,
                isShippingInsurance,
                isHematBiayaKirim,
                desiredNetPrice: 0,
                initialPrice: priceValue,
            });
        }
    }, [
        sellerType,
        category,
        isPreOrder30Days,
        isFreeShippingXtra,
        isPromoXtra,
        isShopeLiveXtra,
        isShippingInsurance,
        isHematBiayaKirim,
        isReverseCalculation,
        inputPrice,
    ]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="gradient-shopee py-10 px-4 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white rounded-full blur-3xl" />
                </div>

                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary-foreground/20 rounded-2xl backdrop-blur-sm">
                            <Calculator className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-3 tracking-tight">
                        Kalkulator Shopee
                    </h1>
                    <p className="text-primary-foreground/80 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        Hitung estimasi penghasilan bersih atau harga jual yang perlu disetel
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
                        <>
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

                            {/* Mode Toggle */}
                            <div className="border-t border-border pt-6">
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    Mode Perhitungan
                                </label>
                                <div className="flex bg-muted rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsReverseCalculation(false);
                                            setInputPrice(null);
                                        }}
                                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                                            isReverseCalculation
                                                ? "text-muted-foreground hover:text-foreground"
                                                : "bg-primary text-primary-foreground shadow-sm"
                                        }`}
                                    >
                                        Hitung Harga Bersih
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsReverseCalculation(true);
                                            setInputPrice(null);
                                        }}
                                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                                            isReverseCalculation
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Hitung Harga Awal
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {category && (
                        <div className="border-t border-border pt-6">
                            <div className="relative">
                                <PriceInput
                                    value={inputPrice}
                                    onChange={setInputPrice}
                                    label={
                                        isReverseCalculation
                                            ? "Harga Bersih yang Diinginkan"
                                            : "Harga Awal"
                                    }
                                    placeholder="Contoh: 100.000"
                                    min={isReverseCalculation ? undefined : 99}
                                    max={isReverseCalculation ? undefined : 150000000}
                                />
                                {/* Compact copy button for Hitung Harga Bersih mode */}
                                {!isReverseCalculation &&
                                    result &&
                                    inputPrice !== null &&
                                    inputPrice !== -0.001 &&
                                    inputPrice >= 99 &&
                                    inputPrice <= 150000000 && (
                                        <button
                                            onClick={copyInputToClipboard}
                                            className="absolute right-3 top-[46px] p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                                            title="Salin harga bersih"
                                        >
                                            {copiedInput ? (
                                                <Check className="w-4 h-4 text-success" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Result Section - show for both modes */}
                <section>
                    {isReverseCalculation ? (
                        <ResultCard
                            result={result}
                            desiredNetPrice={
                                inputPrice === -0.001 || inputPrice === null ? 0 : inputPrice
                            }
                            hasCategory={!!category}
                            isReverseCalculation={isReverseCalculation}
                            minPossibleNetPrice={minPossibleNetPrice}
                            maxPossibleNetPrice={maxPossibleNetPrice}
                            hideCopy={false}
                        />
                    ) : (
                        <ResultCard
                            result={result}
                            desiredNetPrice={0}
                            hasCategory={!!category}
                            isReverseCalculation={isReverseCalculation}
                        />
                    )}
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
