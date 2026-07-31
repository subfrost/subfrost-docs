import {type ReactNode} from 'react';

/**
 * Gabe asked for the second light/dark button in the top right to go
 * (2026-07-29). There were two: our own sun icon, rendered next to the 文
 * locale button by the swizzled LocaleDropdownNavbarItem, and this one, the
 * stock Docusaurus navbar toggle, which sits to the right of the search box.
 * His is the rightmost, so this is the one that goes.
 *
 * Rendering null here rather than setting `colorMode.disableSwitch: true` in
 * docusaurus.config.ts is deliberate. `disableSwitch` also makes theme-common
 * run `ColorModeStorage.del()` on mount, which wipes the reader's stored
 * choice, so our remaining button would still flip the theme but the choice
 * would not survive a reload. Dark mode has to keep working: it is the whole
 * point of the colours Gabe asked for on 2026-07-28.
 *
 * Removing the component instead keeps colorMode enabled and only drops the
 * duplicate control, in the navbar and in the mobile sidebar alike.
 */
export default function NavbarColorModeToggle(): ReactNode {
  return null;
}
