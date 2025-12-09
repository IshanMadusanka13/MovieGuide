"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';

const NO_NAVBAR_ROUTES = ['/', '/login', '/signup', '/register'];

export default function ConditionalNavbarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldShowNavbar = !NO_NAVBAR_ROUTES.includes(pathname || '');
  
  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
}