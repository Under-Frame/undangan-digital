import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1100px] flex-col justify-center px-6 py-24">
      <p className="label-caps text-muted">Error 404</p>
      <div className="my-8 h-px w-16 bg-line" aria-hidden="true" />
      <h1 className="text-[clamp(2.5rem,10vw,4.5rem)]">Undangan tidak ditemukan.</h1>
      <p className="mt-6 max-w-md text-muted">
        Tautan yang Anda buka mungkin salah ketik atau sudah tidak berlaku. Silakan periksa kembali
        tautan dari pengirim undangan.
      </p>
      <div className="mt-10">
        <Link href="/" className="btn-pill hover:bg-fg hover:text-bg">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
