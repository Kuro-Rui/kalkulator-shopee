import { categoryGroups, CategoryData } from "@/data/shopeeCategories";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tag } from "lucide-react";

interface CategorySelectorProps {
    value: CategoryData | null;
    onChange: (category: CategoryData) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
    const handleChange = (categoryName: string) => {
        for (const group of categoryGroups) {
            const category = group.categories.find((c) => c.name === categoryName);
            if (category) {
                onChange(category);
                break;
            }
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Kategori Produk</label>
            <Select value={value?.name || ""} onValueChange={handleChange}>
                <SelectTrigger className="w-full h-12 text-left bg-card border-2 border-border hover:border-primary/50 transition-colors input-glow">
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Pilih kategori produk..." />
                    </div>
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                    {categoryGroups.map((group) => (
                        <SelectGroup key={group.group}>
                            <SelectLabel className="font-bold text-primary py-2">
                                {group.group}
                            </SelectLabel>
                            {group.categories.map((category) => (
                                <SelectItem
                                    key={category.name}
                                    value={category.name}
                                    className="py-2"
                                >
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <span>{category.name}</span>
                                        <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
                                            {category.adminFee}%
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
