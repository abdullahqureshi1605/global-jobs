import Breadcrumbs, {
  type BreadcrumbItem,
} from "./Breadcrumbs";

import BackButton from "./BackButton";

interface PageNavigationProps {
  breadcrumbs: BreadcrumbItem[];

  backLabel?: string;

  backFallbackHref?: string;

  showBack?: boolean;
}

export default function PageNavigation({
  breadcrumbs,
  backLabel = "Back",
  backFallbackHref = "/",
  showBack = true,
}: PageNavigationProps) {
  return (
    <div className="mb-8">
      {showBack && (
        <div className="mb-4">
          <BackButton
            label={backLabel}
            fallbackHref={backFallbackHref}
          />
        </div>
      )}

      <Breadcrumbs
        items={breadcrumbs}
      />
    </div>
  );
}