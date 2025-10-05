export type Product = {
  id: string;
  slug: string;
  title: string;
  image?: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  badge?: "new" | "hit" | "sale";
  inStock?: boolean;
  weightOptions?: string[];

  description?: {
    consistency?: string;
    size?: string;
    color?: string;
    container?: string;
    storage?: string;
    shelfLife?: string;
  };
};
