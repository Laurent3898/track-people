import { useState, useEffect, useRef } from "react";
import {
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaPinterest,
} from "react-icons/fa";

const siteIcons = {
  "linkedin.com": FaLinkedin,
  "twitter.com": FaTwitter,
  "youtube.com": FaYoutube,
  "facebook.com": FaFacebook,
  "instagram.com": FaInstagram,
  "tiktok.com": FaTiktok,
  "pinterest.com": FaPinterest,
};

export default function SiteSelector({ sites, onSelectionChange }) {
  const [selectAll, setSelectAll] = useState(false);
  const selectAllRef = useRef(null);

  useEffect(() => {
    const allSelected = sites.every((site) => site.selected);
    const someSelected = sites.some((site) => site.selected);
    setSelectAll(allSelected);
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [sites]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const updatedSites = sites.map((site) => ({ ...site, selected: checked }));
    onSelectionChange(updatedSites);
    setSelectAll(checked);
  };

  const toggleSiteSelection = (domain) => {
    const updatedSites = sites.map((site) =>
      site.domain === domain ? { ...site, selected: !site.selected } : site
    );
    onSelectionChange(updatedSites);
  };

  return (
    <fieldset className="mb-4">
      <legend className="font-medium text-gray-700 mb-2">
        Select sites to search
      </legend>
      <div className="flex flex-col items-start gap-3">
        <label className="inline-flex items-center gap-3 mb-2">
          <input
            ref={selectAllRef}
            id="select-all"
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="size-5 rounded border-gray-300 shadow-sm"
            aria-label="Select all sites"
          />
          <span className="font-medium text-gray-700">Select All</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sites.map((site, index) => {
            const Icon = siteIcons[site.domain];
            return (
              <label
                key={site.domain}
                htmlFor={`site-${index}`}
                className="flex items-center gap-3 p-2 border rounded hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  id={`site-${index}`}
                  checked={site.selected}
                  onChange={() => toggleSiteSelection(site.domain)}
                  className="size-5 rounded border-gray-300 shadow-sm"
                  aria-label={`Search on ${site.domain}`}
                />
                {Icon && <Icon className="text-xl text-gray-600" />}
                <span className="font-medium text-gray-700">{site.domain}</span>
              </label>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
