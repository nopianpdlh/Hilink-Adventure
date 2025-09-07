// src/app/blog/page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 3600; // Revalidate setiap jam

async function getPublishedPosts() {
    const supabase = await createClient();
    
    console.log("🔍 Fetching published blog posts...");
    
    const { data, error } = await supabase
        .from('blog_posts')
        .select('title, slug, created_at, published_at')
        .not('published_at', 'is', null) // Menggunakan .not() dengan 'is' null
        .order('published_at', { ascending: false });

    if (error) {
        console.error("❌ Error fetching published posts:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // Fallback: try getting all posts without published_at filter
        console.log("🔄 Trying fallback query without published_at filter...");
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('blog_posts')
            .select('title, slug, created_at, published_at')
            .order('created_at', { ascending: false });
            
        if (fallbackError) {
            console.error("🚫 Fallback query also failed:", fallbackError);
            return [];
        }
        
        console.log("✅ Fallback successful, found posts:", fallbackData?.length || 0);
        // Filter published posts on the client side
        return fallbackData?.filter(post => post.published_at != null) || [];
    }
    
    console.log("📝 Published posts found:", data?.length || 0);
    return data || [];
}

function BlogPostCard({ post }: { post: any }) {
    return (
        <Link href={`/blog/${post.slug}`} className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white">
            <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
            <p className="text-sm text-gray-500 mt-2">
                Dipublikasikan pada {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </Link>
    );
}

export default async function BlogPage() {
    const posts = await getPublishedPosts();
    
    // Ambil data user untuk header
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-gray-900">
                        <span className="text-green-600">HiLink</span> Adventure
                    </Link>
                     <div className="flex items-center space-x-4">
                        <Link href="/blog" className="font-semibold text-green-600">Blog</Link>
                        {user ? (
                             <Link href="/dashboard/my-bookings" className="font-medium text-gray-700 hover:text-green-600">Dashboard</Link>
                        ) : (
                            <Link href="/login" className="text-gray-800 hover:text-green-600 font-medium">Login</Link>
                        )}
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Blog & Artikel</h1>
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <BlogPostCard key={post.slug} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-white rounded-lg shadow-sm border p-8">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Artikel</h3>
                            <p className="text-gray-500 mb-4">Artikel blog akan muncul di sini setelah dipublikasikan.</p>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Info untuk Admin:</h4>
                                <div className="text-sm text-blue-700 space-y-1 text-left">
                                    <p>1. Tabel <code className="bg-blue-100 px-1 rounded">blog_posts</code> mungkin belum dibuat</p>
                                    <p>2. Buat tabel dengan kolom: title, slug, content, published_at, created_at</p>
                                    <p>3. Tambahkan beberapa artikel untuk menguji halaman ini</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 justify-center mt-4">
                                <Link href="/" className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                                    Kembali ke Home
                                </Link>
                                {user && (
                                    <Link href="/admin" className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
                                        Admin Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
