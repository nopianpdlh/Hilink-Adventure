// src/app/admin/blog/new/page.tsx

import { createBlogPost } from "@/app/actions";
import Link from "next/link";

export default function NewBlogPostPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Tulis Artikel Baru</h1>
            <div className="bg-white p-8 rounded-lg shadow-sm border">
                <form action={createBlogPost} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Artikel</label>
                        <input type="text" name="title" id="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Konten</label>
                        <textarea id="content" name="content" rows={15} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Tulis konten artikel di sini..."></textarea>
                    </div>
                    <div className="flex items-center">
                        <input id="published" name="published" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <label htmlFor="published" className="ml-3 block text-sm font-medium text-gray-900">Publikasikan sekarang</label>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/admin/blog" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                            Batal
                        </Link>
                        <button type="submit" className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            Simpan Artikel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}