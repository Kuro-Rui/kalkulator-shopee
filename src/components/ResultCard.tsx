import { CalculationResult, formatRupiah } from "@/lib/calculatePrice";
import { cn } from "@/lib/utils";
import { Calculator, Info, Check, Copy, HelpCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ResultCardProps {
    result: CalculationResult | null;
    desiredNetPrice: number;
    hasCategory: boolean;
    isReverseCalculation?: boolean;
    minPossibleNetPrice?: number;
    maxPossibleNetPrice?: number;
    hideCopy?: boolean;
}

interface FeeRowProps {
    fee: { name: string; percentage: number; amount: number; maxAmount?: number };
    formatFeeDescription: (fee: { name: string; percentage: number; maxAmount?: number }) => string;
}

function FeeRow({ fee, formatFeeDescription }: FeeRowProps) {
    return (
        <div
            className={cn(
                "px-5 py-3 flex items-center justify-between",
                "hover:bg-muted/30 transition-colors",
            )}
        >
            <div className="flex items-center gap-1.5">
                <span className="text-sm text-foreground">{fee.name}</span>
                {fee.percentage > 0 && (
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{formatFeeDescription(fee)}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            <span className="font-semibold text-destructive">-{formatRupiah(fee.amount)}</span>
        </div>
    );
}

export function ResultCard({
    result,
    desiredNetPrice,
    hasCategory,
    isReverseCalculation = true,
    minPossibleNetPrice,
    maxPossibleNetPrice,
    hideCopy = true,
}: ResultCardProps) {
    const copyToClipboard = () => {
        if (result && !hideCopy) {
            const valueToCopy = isReverseCalculation ? result.initialPrice : result.netPrice;
            navigator.clipboard.writeText(valueToCopy.toString());
            toast.success("Harga berhasil disalin!");
        }
    };

    if (!hasCategory) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">
                    Pilih kategori produk terlebih dahulu untuk melanjutkan
                </p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">
                    {isReverseCalculation
                        ? "Masukkan harga bersih yang diinginkan untuk melihat hasil perhitungan"
                        : "Masukkan harga awal untuk melihat hasil perhitungan"}
                </p>
            </div>
        );
    }

    // Untuk mode Hitung Harga Awal, cek apakah input lebih kecil dari minimal yang bisa dicapai
    const isBelowMinimum =
        isReverseCalculation &&
        minPossibleNetPrice !== undefined &&
        desiredNetPrice < minPossibleNetPrice;

    // Tampilkan error jika harga bersih yang diinginkan lebih kecil dari minimal
    if (isBelowMinimum) {
        return (
            <div className="rounded-2xl border-2 border-destructive/50 bg-destructive/5 p-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-3" />
                <p className="text-destructive font-semibold mb-1">
                    Harga bersih tidak dapat dicapai
                </p>
                <p className="text-sm text-muted-foreground">
                    Minimal total penghasilan {formatRupiah(minPossibleNetPrice!)}
                </p>
            </div>
        );
    }

    // Untuk mode Hitung Harga Awal, cek apakah input melebihi batas maksimum
    const isAboveMaximum =
        isReverseCalculation &&
        maxPossibleNetPrice !== undefined &&
        desiredNetPrice > maxPossibleNetPrice;

    // Tampilkan error jika harga bersih yang diinginkan melebihi maksimum
    if (isAboveMaximum) {
        return (
            <div className="rounded-2xl border-2 border-destructive/50 bg-destructive/5 p-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-3" />
                <p className="text-destructive font-semibold mb-1">
                    Harga bersih melebihi batas maksimum
                </p>
                <p className="text-sm text-muted-foreground">
                    Maksimal total penghasilan adalah {formatRupiah(maxPossibleNetPrice!)}
                </p>
            </div>
        );
    }

    const formatFeeDescription = (fee: {
        name: string;
        percentage: number;
        maxAmount?: number;
    }) => {
        if (fee.percentage === 0) return `Biaya tetap`;
        let desc = `${fee.percentage}% dari harga produk`;
        if (fee.maxAmount) desc += ` (maks. ${formatRupiah(fee.maxAmount)})`;
        return desc;
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
                {/* Header - Harga Utama */}
                <div
                    className={cn(
                        "gradient-shopee px-5 py-6 text-center relative",
                        !hideCopy && "cursor-pointer group",
                    )}
                    onClick={hideCopy ? undefined : copyToClipboard}
                >
                    <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                        {isReverseCalculation
                            ? "Harga yang Harus Disetel"
                            : "Harga Bersih yang Diterima"}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-4xl md:text-5xl font-extrabold text-primary-foreground">
                            {formatRupiah(
                                isReverseCalculation ? result.initialPrice : result.netPrice,
                            )}
                        </p>
                        {!hideCopy && (
                            <Copy className="w-5 h-5 text-primary-foreground/60 group-hover:text-primary-foreground transition-colors" />
                        )}
                    </div>
                    {!hideCopy && (
                        <p className="text-primary-foreground/60 text-xs mt-2">
                            Klik untuk menyalin
                        </p>
                    )}
                </div>

                {/* Rincian Potongan Header */}
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Rincian Potongan
                    </h3>
                </div>

                {/* Rincian Potongan List */}
                <div className="divide-y divide-border">
                    {/* Biaya Administrasi */}
                    {result.breakdown
                        .filter((fee) => fee.name === "Biaya Administrasi")
                        .map((fee, index) => (
                            <FeeRow
                                key={`admin-${index}`}
                                fee={fee}
                                formatFeeDescription={formatFeeDescription}
                            />
                        ))}

                    {/* Premi */}
                    {result.breakdown
                        .filter((fee) => fee.name === "Premi")
                        .map((fee, index) => (
                            <FeeRow
                                key={`premi-${index}`}
                                fee={fee}
                                formatFeeDescription={formatFeeDescription}
                            />
                        ))}

                    {/* Biaya Layanan */}
                    {result.breakdown.filter(
                        (fee) =>
                            fee.name !== "Biaya Administrasi" &&
                            fee.name !== "Premi" &&
                            fee.name !== "Biaya Proses Pesanan",
                    ).length > 0 && (
                        <div className="px-5 py-2 bg-muted/20">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Biaya Layanan
                            </span>
                        </div>
                    )}
                    {result.breakdown
                        .filter(
                            (fee) =>
                                fee.name !== "Biaya Administrasi" &&
                                fee.name !== "Premi" &&
                                fee.name !== "Biaya Proses Pesanan",
                        )
                        .map((fee, index) => (
                            <FeeRow
                                key={`layanan-${index}`}
                                fee={fee}
                                formatFeeDescription={formatFeeDescription}
                            />
                        ))}

                    {/* Biaya Proses Pesanan */}
                    {result.breakdown.filter((fee) => fee.name === "Biaya Proses Pesanan").length >
                        0 && (
                        <div className="px-5 py-2 bg-muted/20">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Biaya Proses Pesanan
                            </span>
                        </div>
                    )}
                    {result.breakdown
                        .filter((fee) => fee.name === "Biaya Proses Pesanan")
                        .map((fee, index) => (
                            <FeeRow
                                key={`proses-${index}`}
                                fee={fee}
                                formatFeeDescription={formatFeeDescription}
                            />
                        ))}

                    {/* Total Potongan */}
                    <div className="px-5 py-4 flex items-center justify-between bg-muted/50 border-t border-border">
                        <span className="font-bold">Total Potongan</span>
                        <div className="text-right">
                            <span className="font-bold text-destructive text-lg">
                                -{formatRupiah(result.totalFeeAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Footer - Harga Sekunder */}
                    <div className="px-5 py-4 flex items-center justify-between bg-success/10">
                        <span className="font-bold flex items-center gap-2 text-success">
                            <Check className="w-4 h-4" />
                            Estimasi Total Penghasilan
                        </span>
                        <span className="font-bold text-success text-xl">
                            {formatRupiah(result.netPrice)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
