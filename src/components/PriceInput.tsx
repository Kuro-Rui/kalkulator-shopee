import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PriceInputProps {
    value: number;
    onChange: (value: number) => void;
    label: string;
    placeholder?: string;
    className?: string;
}

export function PriceInput({
    value,
    onChange,
    label,
    placeholder,
    className,
}: PriceInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Izinkan minus di awal dan angka saja
        const isNegative = inputValue.startsWith("-");
        const rawValue = inputValue.replace(/[^\d]/g, "");
        const numValue = parseInt(rawValue, 10) || 0;

        onChange(isNegative ? -numValue : numValue);
    };

    const displayValue =
        value !== 0 ? (value < 0 ? "-" : "") + Math.abs(value).toLocaleString("id-ID") : "";

    return (
        <div className={cn("space-y-3", className)}>
            <label className="block text-sm font-semibold text-foreground">{label}</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    Rp
                </span>
                <Input
                    type="text"
                    inputMode="text"
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="h-14 pl-12 pr-4 text-lg font-semibold bg-card border-2 border-border hover:border-primary/50 focus:border-primary input-glow transition-colors"
                />
            </div>
        </div>
    );
}
