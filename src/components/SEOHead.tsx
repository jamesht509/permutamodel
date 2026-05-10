import { useEffect } from "react";
import { getBrand } from "@/lib/brand";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEOHead({ title, description, image, url }: SEOHeadProps) {
  const brand = getBrand();
  const finalTitle = title || brand.seo.title;
  const finalDesc = description || brand.seo.description;
  const finalImage = (() => {
    const img = image || brand.seo.image;
    if (img.startsWith("http")) return img;
    return typeof window !== "undefined" ? `${window.location.origin}${img}` : img;
  })();

  useEffect(() => {
    document.title = finalTitle;
    document.documentElement.lang = brand.lang;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("article:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", finalDesc);
    setMeta("og:title", finalTitle);
    setMeta("og:description", finalDesc);
    setMeta("og:image", finalImage);
    setMeta("og:type", "website");
    setMeta("og:site_name", brand.name);
    setMeta("og:locale", brand.lang === "pt-BR" ? "pt_BR" : "en_US");
    setMeta("og:url", url || window.location.href);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDesc);
    setMeta("twitter:image", finalImage);
  }, [finalTitle, finalDesc, finalImage, url, brand]);

  return null;
}
