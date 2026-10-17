import type { RomanV2Products } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import shared from "./contemporary-roman.module.css";
import s from "./SelectedProducts.module.css";

export default function SelectedProducts({ products }: { products: RomanV2Products }) {
  return (
    <section id="products" aria-labelledby="products-title" className={`${shared.section} ${s.section}`}>
      <div className={shared.container}>
        <h2 id="products-title" className={shared.h2}>
          {products.heading.lead} <span className={shared.accent}>{products.heading.accent}</span>
        </h2>
        <p className={shared.lede}>{products.body}</p>
        <ul>
          {products.items.map((product) => (
            <li key={product.id}>
              <h3 className={shared.h3}>{product.name}</h3>
              <p>{product.tagline}</p>
              <AvailabilityAction
                action={product.primaryAction}
                variant={product.featured ? "primary" : "icon"}
                arrow={product.featured ? "up-right" : "right"}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
