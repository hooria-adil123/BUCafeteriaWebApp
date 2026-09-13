import Link from "next/link";
import { Logo } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">
        <div className="flex justify-center">
          <Logo size={72} />
        </div>
        <h1 className="mt-4 font-display text-3xl text-navy">Page not found</h1>
        <p className="mt-3 text-ocean">That cafeteria page does not exist.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Back to home
        </Link>
      </div>
    </main>
  );
}
