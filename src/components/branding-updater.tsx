"use client";

import { useEffect } from "react";
import { useOrganization } from "./organization-provider";

export function BrandingUpdater() {
  const { organization } = useOrganization();

  useEffect(() => {
    if (organization?.faviconUrl) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = organization.faviconUrl;
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "shortcut icon";
        newLink.href = organization.faviconUrl;
        document.getElementsByTagName("head")[0].appendChild(newLink);
      }
    }

    if (organization?.siteTitle) {
      document.title = organization.siteTitle;
    }
  }, [organization?.faviconUrl, organization?.siteTitle]);

  return null;
}
