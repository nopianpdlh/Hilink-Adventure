// src/app/admin/blog/page.tsx

import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

async function getBlogPosts() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, created_at, published_at')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
    return data;
}

export default async function BlogManagementPage() {
    const posts = await getBlogPosts();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Blog</h1>
                <Link href="/admin/blog/new" className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                    <Plus className="w-5 h-5" />
                    <span>Tulis Artikel Baru</span>
                </Link>
            </div>

            <div className="bg-white p-2 rounded-lg shadow-sm border">
                 <div className="flow-root">
                    <div className="inline-block min-w-full py-2 align-middle">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Judul</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tgl. Dibuat</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Aksi</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {posts.map((post) => (
                                    <tr key={post.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{post.title}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {post.published_at ? 
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Published</span> : 
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Draft</span>
                                            }
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                           <a href="#" className="text-green-600 hover:text-green-900">Edit</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
