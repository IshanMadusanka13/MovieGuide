"use client";
import { useRouter } from 'next/navigation';
import { use, useEffect } from "react";

export default function Home() {

  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, []);

  return (
    <div></div>
  );
}
